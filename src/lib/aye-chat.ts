const AYE_BASE_URL = process.env.AYE_CHAT_BASE_URL ?? "https://api.ayechat.ai";
const POLL_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_500;

type InvokeCliResponse = {
  response_url?: string;
};

type PollResponse = {
  streaming?: boolean;
  partial_content?: string;
  assistant_response?: string | Record<string, unknown>;
};

export async function invokeAyeChat(params: {
  apiToken: string;
  message: string;
  systemPrompt: string;
  sourceFiles?: Record<string, string>;
}): Promise<string> {
  const body = {
    chat_id: -1,
    message: params.message,
    source_files: params.sourceFiles ?? {},
    system_prompt: params.systemPrompt,
    max_output_tokens: parseMaxOutputTokens(process.env.AYE_CHAT_MAX_OUTPUT_TOKENS),
    model: process.env.AYE_CHAT_MODEL || undefined,
    streaming: true,
  };

  const invokeResponse = await fetch(`${AYE_BASE_URL}/invoke_cli`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiToken}`,
      "Content-Type": "application/json",
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
    throw new Error("Aye Chat did not return a response URL.");
  }

  return pollForSummary(invokePayload.response_url);
}

async function pollForSummary(responseUrl: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastPartial = "";

  while (Date.now() < deadline) {
    const response = await fetch(responseUrl, {
      cache: "no-store",
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
      if (typeof payload.partial_content === "string" && payload.partial_content.trim()) {
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

    throw new Error("Aye Chat returned an empty response.");
  }

  throw new Error("Aye Chat timed out before returning a completed response.");
}

function extractSummaryFromPoll(payload: PollResponse): string {
  if (typeof payload.assistant_response === "string") {
    return parseAssistantResponse(payload.assistant_response);
  }

  if (isRecord(payload.assistant_response)) {
    const answerSummary = payload.assistant_response.answer_summary;
    if (typeof answerSummary === "string") {
      return answerSummary.trim();
    }
  }

  return "";
}

function parseAssistantResponse(value: string): string {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === "string") {
      return parsed.trim();
    }

    if (isRecord(parsed) && typeof parsed.answer_summary === "string") {
      return parsed.answer_summary.trim();
    }
  } catch {
    return value.trim();
  }

  return value.trim();
}

function parseMaxOutputTokens(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2200;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
