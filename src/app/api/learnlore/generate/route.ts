import { NextResponse, type NextRequest } from 'next/server';

import { PDFParse } from 'pdf-parse';

import type { Concept, MemoryHook } from '@/lib/mock/concepts';

export const runtime = 'nodejs';

const AYE_BASE_URL = process.env.AYE_CHAT_BASE_URL ?? 'https://api.ayechat.ai';
const STORY_HOOK_SEPARATOR = '|||';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const POLL_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_500;
const DEFAULT_EMOJI = '📘';
const SYSTEM_PROMPT = [
  'You are LearnLore, an educational storyteller for students.',
  'Turn the provided topic or notes into one vivid, accurate story plus memory hooks in a single response.',
  'If source files include extracted text, treat that as the primary study material.',
  'If source files include an image data URL, read the visible notes from that image before writing the output.',
  'Be memorable, but do not invent niche facts that are not supported by the topic or notes.',
  'Return plain text in the exact format below and nothing else:',
  'TITLE:: <2-6 word study title>',
  'EMOJI:: <one emoji>',
  'STORY::',
  '<one story between 180 and 320 words>',
  '|||',
  'HOOKS::',
  '1. <short hook phrase> => <what it helps remember>',
  '2. <short hook phrase> => <what it helps remember>',
  '3. <short hook phrase> => <what it helps remember>',
  '4. <short hook phrase> => <what it helps remember>',
  'Return 4 to 6 hooks.',
  'Keep hook phrases short and concrete.',
].join('\n');

type UploadPayload = {
  fallbackTitle: string;
  sourceFiles: Record<string, string>;
};

type InvokeCliResponse = {
  response_url?: string;
};

type PollResponse = {
  streaming?: boolean;
  partial_content?: string;
  assistant_response?: string | Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const apiToken = process.env.AYE_CHAT_API_TOKEN;
  if (!apiToken) {
    return jsonResponse(500, apiError('Missing AYE_CHAT_API_TOKEN on the server.'));
  }

  const formData = await request.formData();
  const topic = String(formData.get('topic') ?? '').trim();
  const file = formData.get('file');

  if (!topic && !(file instanceof File)) {
    return jsonResponse(400, apiError('Add a topic or upload a file first.'));
  }

  if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
    return jsonResponse(400, apiError('Uploads must be 8 MB or smaller.'));
  }

  try {
    const upload = file instanceof File ? await normalizeUpload(file) : null;
    const fallbackTitle = deriveFallbackTitle(topic, upload?.fallbackTitle);
    const concept = await generateConcept({
      apiToken,
      topic,
      fallbackTitle,
      sourceFiles: upload?.sourceFiles ?? {},
    });

    return jsonResponse(200, apiData({ concept }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate a story and memory hooks.';

    return jsonResponse(500, apiError(message));
  }
}

async function generateConcept(params: {
  apiToken: string;
  topic: string;
  fallbackTitle: string;
  sourceFiles: Record<string, string>;
}): Promise<Concept> {
  const body = {
    chat_id: -1,
    streaming: true,
    system_prompt: SYSTEM_PROMPT,
    max_output_tokens: parseMaxOutputTokens(process.env.AYE_CHAT_MAX_OUTPUT_TOKENS),
    model: process.env.AYE_CHAT_MODEL || undefined,
    source_files: params.sourceFiles,
    user_message: buildUserMessage(params.topic, params.fallbackTitle, params.sourceFiles),
  };

  const invokeResponse = await fetch(`${AYE_BASE_URL}/invoke_cli`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!invokeResponse.ok) {
    const errorText = await invokeResponse.text();
    throw new Error(`Aye Chat request failed (${invokeResponse.status}): ${errorText}`);
  }

  const invokePayload = (await invokeResponse.json()) as InvokeCliResponse;
  if (!invokePayload.response_url) {
    throw new Error('Aye Chat did not return a response URL.');
  }

  const summary = await pollForSummary(invokePayload.response_url, params.apiToken);
  const parsed = parseConceptSummary(summary, params.fallbackTitle);

  return {
    id: Date.now(),
    title: parsed.title,
    emoji: parsed.emoji,
    date: 'Just now',
    story: parsed.story,
    hooks: parsed.hooks,
  };
}

async function pollForSummary(responseUrl: string, apiToken: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastPartial = '';

  while (Date.now() < deadline) {
    const response = await fetch(responseUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status === 403 || response.status === 404) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aye Chat polling failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as PollResponse;
    if (payload.streaming) {
      if (typeof payload.partial_content === 'string' && payload.partial_content.trim()) {
        lastPartial = payload.partial_content.trim();
      }

      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const summary = extractSummaryFromPoll(payload);
    if (summary) {
      return summary;
    }

    if (lastPartial) {
      return lastPartial;
    }

    throw new Error('Aye Chat returned an empty response.');
  }

  throw new Error('Aye Chat timed out before returning a completed response.');
}

function extractSummaryFromPoll(payload: PollResponse): string {
  if (typeof payload.assistant_response === 'string') {
    return parseAssistantResponse(payload.assistant_response);
  }

  if (isRecord(payload.assistant_response)) {
    const answerSummary = payload.assistant_response.answer_summary;
    if (typeof answerSummary === 'string') {
      return answerSummary.trim();
    }
  }

  return '';
}

function parseAssistantResponse(value: string): string {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === 'string') {
      return parsed.trim();
    }

    if (isRecord(parsed) && typeof parsed.answer_summary === 'string') {
      return parsed.answer_summary.trim();
    }
  } catch {
    return value.trim();
  }

  return value.trim();
}

async function normalizeUpload(file: File): Promise<UploadPayload> {
  const extension = getFileExtension(file.name);
  const safeBaseName = sanitizeFileStem(file.name);

  if (extension === 'pdf' || file.type === 'application/pdf') {
    return normalizePdf(file, safeBaseName);
  }

  if (file.type.startsWith('image/')) {
    return {
      fallbackTitle: safeBaseName,
      sourceFiles: {
        [`uploads/${safeBaseName}.${extension || 'png'}`]: await fileToDataUrl(file),
      },
    };
  }

  if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md') {
    const text = normalizeWhitespace(await file.text());
    if (!text) {
      throw new Error('The uploaded text file is empty.');
    }

    return {
      fallbackTitle: safeBaseName,
      sourceFiles: {
        [`uploads/${safeBaseName}.${extension || 'txt'}`]: text,
      },
    };
  }

  throw new Error('Unsupported file type. Use PDF, TXT, MD, PNG, JPG, or WEBP.');
}

async function normalizePdf(file: File, safeBaseName: string): Promise<UploadPayload> {
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });

  try {
    const sourceFiles: Record<string, string> = {};

    const textResult = await parser.getText({ partial: [1] });
    const firstPageText = normalizeWhitespace(textResult.text ?? '');
    if (firstPageText) {
      sourceFiles[`uploads/${safeBaseName}-page-1.txt`] = firstPageText;
    }

    const screenshotResult = await parser.getScreenshot({
      partial: [1],
      desiredWidth: 1200,
      imageBuffer: false,
      imageDataUrl: true,
    });
    const firstPageImage = screenshotResult.pages[0]?.dataUrl;
    if (firstPageImage) {
      sourceFiles[`uploads/${safeBaseName}-page-1.png`] = firstPageImage;
    }

    if (Object.keys(sourceFiles).length === 0) {
      throw new Error('The first page of the PDF could not be read.');
    }

    return {
      fallbackTitle: safeBaseName,
      sourceFiles,
    };
  } finally {
    await parser.destroy();
  }
}

function buildUserMessage(
  topic: string,
  fallbackTitle: string,
  sourceFiles: Record<string, string>,
): string {
  const lines = [
    'Generate a LearnLore study story and matching memory hooks.',
    `Fallback title: ${fallbackTitle}`,
  ];

  if (topic) {
    lines.push(`Student topic: ${topic}`);
  }

  if (Object.keys(sourceFiles).length > 0) {
    lines.push('Use the attached source files as the main study material.');
    lines.push('If a PDF was uploaded, only the first page has been supplied.');
  }

  return lines.join('\n');
}

function parseConceptSummary(
  summary: string,
  fallbackTitle: string,
): { title: string; emoji: string; story: string; hooks: MemoryHook[] } {
  const normalized = summary.replace(/\r\n/g, '\n').trim();
  const [storySection, hooksSection = ''] = normalized.split(STORY_HOOK_SEPARATOR);

  const title = extractPrefixedLine(normalized, 'TITLE::') || fallbackTitle;
  const emoji = extractPrefixedLine(normalized, 'EMOJI::') || DEFAULT_EMOJI;
  const story =
    extractStory(storySection) ||
    normalized ||
    'No story was returned. Try refining the topic or re-uploading the notes.';
  const hooks = parseHooks(hooksSection);

  return { title, emoji, story, hooks };
}

function extractStory(section: string): string {
  const marker = 'STORY::';
  const markerIndex = section.indexOf(marker);
  const content = markerIndex >= 0 ? section.slice(markerIndex + marker.length) : section;

  return content
    .replace(/^TITLE::.*$/gim, '')
    .replace(/^EMOJI::.*$/gim, '')
    .trim();
}

function parseHooks(section: string): MemoryHook[] {
  const content = section.replace(/^HOOKS::/i, '').trim();
  if (!content) {
    return [];
  }

  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '').trim())
    .map((line) => {
      const separator = line.includes('=>')
        ? '=>'
        : line.includes('::')
          ? '::'
          : line.includes(' - ')
            ? ' - '
            : ':';

      const [hook, ...rest] = line.split(separator);
      return {
        hook: hook?.trim() || 'Memory hook',
        target: rest.join(separator).trim() || line.trim(),
      };
    })
    .filter((hook) => hook.hook && hook.target);
}

function extractPrefixedLine(text: string, prefix: string): string {
  return (
    text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith(prefix))
      ?.slice(prefix.length)
      .trim() ?? ''
  );
}

function deriveFallbackTitle(topic: string, fileFallbackTitle?: string): string {
  if (topic) {
    return topic.length > 48 ? `${topic.slice(0, 45).trim()}...` : topic;
  }

  return fileFallbackTitle || 'Uploaded Notes';
}

function sanitizeFileStem(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '').trim();
  const compact = withoutExtension.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return compact || 'uploaded-notes';
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

async function fileToDataUrl(file: File): Promise<string> {
  const mimeType = file.type || 'application/octet-stream';
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function parseMaxOutputTokens(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2200;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function apiData<T>(data: T): { data: T } {
  return { data };
}

function apiError(error: string): { error: string } {
  return { error };
}

function jsonResponse<T>(status: number, body: { data?: T; error?: string }) {
  return NextResponse.json(body, { status });
}
