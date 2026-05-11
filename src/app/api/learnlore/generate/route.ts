import { NextResponse, type NextRequest } from "next/server";

import type { Concept, MemoryHook } from "@/lib/mock/concepts";
import { invokeAyeChat } from "@/lib/aye-chat";
import { deriveFallbackTitle, normalizeUpload, validateUploadSize } from "@/lib/uploads";

export const runtime = "nodejs";

const STORY_HOOK_SEPARATOR = "|||";
const DEFAULT_EMOJI = "📘";
const SYSTEM_PROMPT = [
  "You are LearnLore, an educational storyteller for students.",
  "Turn the provided topic or notes into one vivid, accurate story plus memory hooks in a single response.",
  "If source files include extracted text, treat that as the primary study material.",
  "If source files include an image data URL, read the visible notes from that image before writing the output.",
  "Be memorable, but do not invent niche facts that are not supported by the topic or notes.",
  "Return plain text in the exact format below and nothing else:",
  "TITLE:: <2-6 word study title>",
  "EMOJI:: <one emoji>",
  "STORY::",
  "<one story between 180 and 320 words>",
  "|||",
  "HOOKS::",
  "1. <short hook phrase> => <what it helps remember>",
  "2. <short hook phrase> => <what it helps remember>",
  "3. <short hook phrase> => <what it helps remember>",
  "4. <short hook phrase> => <what it helps remember>",
  "Return 4 to 6 hooks.",
  "Keep hook phrases short and concrete.",
].join("\n");

export async function POST(request: NextRequest) {
  const apiToken = process.env.AYE_CHAT_API_TOKEN;
  if (!apiToken) {
    return jsonResponse(500, apiError("Missing AYE_CHAT_API_TOKEN on the server."));
  }

  const formData = await request.formData();
  const topic = String(formData.get("topic") ?? "").trim();
  const file = formData.get("file");

  if (!topic && !(file instanceof File)) {
    return jsonResponse(400, apiError("Add a topic or upload a file first."));
  }

  try {
    if (file instanceof File) {
      validateUploadSize(file);
    }

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
      error instanceof Error ? error.message : "Failed to generate a story and memory hooks.";

    return jsonResponse(500, apiError(message));
  }
}

async function generateConcept(params: {
  apiToken: string;
  topic: string;
  fallbackTitle: string;
  sourceFiles: Record<string, string>;
}): Promise<Concept> {
  const summary = await invokeAyeChat({
    apiToken: params.apiToken,
    message: buildUserMessage(params.topic, params.fallbackTitle, params.sourceFiles),
    systemPrompt: SYSTEM_PROMPT,
    sourceFiles: params.sourceFiles,
  });
  const parsed = parseConceptSummary(summary, params.fallbackTitle);

  return {
    id: Date.now(),
    title: parsed.title,
    emoji: parsed.emoji,
    date: "Just now",
    story: parsed.story,
    hooks: parsed.hooks,
  };
}

function buildUserMessage(
  topic: string,
  fallbackTitle: string,
  sourceFiles: Record<string, string>,
): string {
  const lines = [
    "Generate a LearnLore study story and matching memory hooks.",
    `Fallback title: ${fallbackTitle}`,
  ];

  if (topic) {
    lines.push(`Student topic: ${topic}`);
  }

  if (Object.keys(sourceFiles).length > 0) {
    lines.push("Use the attached source files as the main study material.");
    lines.push("If a PDF was uploaded, only the first page has been supplied.");
  }

  return lines.join("\n");
}

function parseConceptSummary(
  summary: string,
  fallbackTitle: string,
): { title: string; emoji: string; story: string; hooks: MemoryHook[] } {
  const normalized = summary.replace(/\r\n/g, "\n").trim();
  const [storySection, hooksSection = ""] = normalized.split(STORY_HOOK_SEPARATOR);

  const title = extractPrefixedLine(normalized, "TITLE::") || fallbackTitle;
  const emoji = extractPrefixedLine(normalized, "EMOJI::") || DEFAULT_EMOJI;
  const story =
    extractStory(storySection) ||
    normalized ||
    "No story was returned. Try refining the topic or re-uploading the notes.";
  const hooks = parseHooks(hooksSection);

  return { title, emoji, story, hooks };
}

function extractStory(section: string): string {
  const marker = "STORY::";
  const markerIndex = section.indexOf(marker);
  const content = markerIndex >= 0 ? section.slice(markerIndex + marker.length) : section;

  return content.replace(/^TITLE::.*$/gim, "").replace(/^EMOJI::.*$/gim, "").trim();
}

function parseHooks(section: string): MemoryHook[] {
  const content = section.replace(/^HOOKS::/i, "").trim();
  if (!content) {
    return [];
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim())
    .map((line) => {
      const separator = line.includes("=>")
        ? "=>"
        : line.includes("::")
          ? "::"
          : line.includes(" - ")
            ? " - "
            : ":";

      const [hook, ...rest] = line.split(separator);
      return {
        hook: hook?.trim() || "Memory hook",
        target: rest.join(separator).trim() || line.trim(),
      };
    })
    .filter((hook) => hook.hook && hook.target);
}

function extractPrefixedLine(text: string, prefix: string): string {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith(prefix))
      ?.slice(prefix.length)
      .trim() ?? ""
  );
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
