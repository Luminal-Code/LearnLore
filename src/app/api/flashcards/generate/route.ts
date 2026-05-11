import { NextResponse, type NextRequest } from "next/server";

import { invokeAyeChat } from "@/lib/aye-chat";
import { deriveFallbackTitle, normalizeUpload, validateUploadSize } from "@/lib/uploads";

export const runtime = "nodejs";

const CARD_SEPARATOR = "§§CARD_BREAK§§";
const SECTION_SEPARATOR = "§§FLASHCARDS§§";
const DEFAULT_EMOJI = "🧠";
const SYSTEM_PROMPT = [
  "You are LearnLore, an expert study coach that turns notes into revision flashcards.",
  "Use the provided topic or note files as the source of truth.",
  "If image data URLs are supplied, read the visible notes from the image before writing the deck.",
  "Generate concise, accurate flashcards for active recall. Do not invent unsupported facts.",
  "Return plain text in the exact format below and nothing else.",
  "TITLE:: <2-6 word deck title>",
  "EMOJI:: <one emoji>",
  "SUMMARY:: <one sentence about the deck focus>",
  "§§FLASHCARDS§§",
  "TAG:: <topic label>",
  "TYPE:: <Definition|Process|Comparison|Cause and Effect|Example|Classification>",
  "FRONT:: <the question shown on the front>",
  "BACK:: <the answer shown after reveal>",
  "EXPLANATION:: <1-2 sentence explanation>",
  "HOOK:: <short memory hook>",
  "SOURCE:: <where this came from in the notes, or 'Provided notes'>",
  "REVIEW_REASON:: <why this card matters>",
  "COACH_TIP:: <how the student should recall it>",
  "§§CARD_BREAK§§",
  "Repeat the card block for 5 to 8 cards total.",
  "Keep each FRONT and BACK self-contained.",
  "Do not add numbering, markdown, or extra commentary.",
].join("\n");

type Flashcard = {
  id: number;
  front: string;
  tag: string;
  type: string;
  back: string;
  explanation: string;
  hook: string;
  source: string;
  reviewReason: string;
  coachTip: string;
};

type FlashcardDeck = {
  id: number;
  title: string;
  emoji: string;
  summary: string;
  date: string;
  cards: Flashcard[];
};

export async function POST(request: NextRequest) {
  const apiToken = process.env.AYE_CHAT_API_TOKEN;
  if (!apiToken) {
    return jsonResponse(500, apiError("Missing AYE_CHAT_API_TOKEN on the server."));
  }

  const formData = await request.formData();
  const notes = String(formData.get("notes") ?? "").trim();
  const file = formData.get("file");

  if (!notes && !(file instanceof File)) {
    return jsonResponse(400, apiError("Add study notes or upload a file first."));
  }

  try {
    if (file instanceof File) {
      validateUploadSize(file);
    }

    const upload = file instanceof File ? await normalizeUpload(file) : null;
    const fallbackTitle = deriveFallbackTitle(notes, upload?.fallbackTitle);
    const deck = await generateDeck({
      apiToken,
      notes,
      fallbackTitle,
      sourceFiles: upload?.sourceFiles ?? {},
    });

    return jsonResponse(200, apiData({ deck }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate flashcards from your notes.";

    return jsonResponse(500, apiError(message));
  }
}

async function generateDeck(params: {
  apiToken: string;
  notes: string;
  fallbackTitle: string;
  sourceFiles: Record<string, string>;
}): Promise<FlashcardDeck> {
  const summary = await invokeAyeChat({
    apiToken: params.apiToken,
    message: buildUserMessage(params.notes, params.fallbackTitle, params.sourceFiles),
    systemPrompt: SYSTEM_PROMPT,
    sourceFiles: params.sourceFiles,
  });

  return parseFlashcardDeck(summary, params.fallbackTitle);
}

function buildUserMessage(
  notes: string,
  fallbackTitle: string,
  sourceFiles: Record<string, string>,
): string {
  const lines = [
    "Create a flashcard deck from the student's material.",
    `Fallback title: ${fallbackTitle}`,
  ];

  if (notes) {
    lines.push("Student notes:");
    lines.push(notes);
  }

  if (Object.keys(sourceFiles).length > 0) {
    lines.push("Use the attached source files as the main study material.");
    lines.push("If a PDF was uploaded, only the first page has been supplied.");
  }

  return lines.join("\n");
}

function parseFlashcardDeck(summary: string, fallbackTitle: string): FlashcardDeck {
  const normalized = summary.replace(/\r\n/g, "\n").trim();
  const [metaSection, cardsSection = ""] = normalized.split(SECTION_SEPARATOR);
  const title = extractPrefixedLine(metaSection, "TITLE::") || fallbackTitle;
  const emoji = extractPrefixedLine(metaSection, "EMOJI::") || DEFAULT_EMOJI;
  const deckSummary =
    extractPrefixedLine(metaSection, "SUMMARY::") || "Freshly generated from your notes.";
  const cards = parseCards(cardsSection);

  if (cards.length === 0) {
    throw new Error("The flashcard generator returned no cards.");
  }

  return {
    id: Date.now(),
    title,
    emoji,
    summary: deckSummary,
    date: "Just now",
    cards,
  };
}

function parseCards(section: string): Flashcard[] {
  return section
    .split(CARD_SEPARATOR)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => parseCard(entry, index));
}

function parseCard(section: string, index: number): Flashcard {
  const front = extractPrefixedLine(section, "FRONT::");
  const back = extractPrefixedLine(section, "BACK::");

  if (!front || !back) {
    throw new Error("One of the generated flashcards was missing its front or back.");
  }

  return {
    id: index + 1,
    tag: extractPrefixedLine(section, "TAG::") || "General",
    type: extractPrefixedLine(section, "TYPE::") || "Concept",
    front,
    back,
    explanation:
      extractPrefixedLine(section, "EXPLANATION::") || "No explanation was returned.",
    hook: extractPrefixedLine(section, "HOOK::") || "No memory hook was returned.",
    source: extractPrefixedLine(section, "SOURCE::") || "Provided notes",
    reviewReason:
      extractPrefixedLine(section, "REVIEW_REASON::") ||
      "This card captures a key point from the provided material.",
    coachTip:
      extractPrefixedLine(section, "COACH_TIP::") ||
      "Try recalling the answer before flipping the card.",
  };
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
