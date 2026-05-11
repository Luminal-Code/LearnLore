import { PDFParse } from "pdf-parse";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type UploadPayload = {
  fallbackTitle: string;
  sourceFiles: Record<string, string>;
};

export function validateUploadSize(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Uploads must be 8 MB or smaller.");
  }
}

export async function normalizeUpload(file: File): Promise<UploadPayload> {
  const extension = getFileExtension(file.name);
  const safeBaseName = sanitizeFileStem(file.name);

  if (extension === "pdf" || file.type === "application/pdf") {
    return normalizePdf(file, safeBaseName);
  }

  if (file.type.startsWith("image/")) {
    return {
      fallbackTitle: safeBaseName,
      sourceFiles: {
        [`uploads/${safeBaseName}.${extension || "png"}`]: await fileToDataUrl(file),
      },
    };
  }

  if (file.type.startsWith("text/") || extension === "txt" || extension === "md") {
    const text = normalizeWhitespace(await file.text());
    if (!text) {
      throw new Error("The uploaded text file is empty.");
    }

    return {
      fallbackTitle: safeBaseName,
      sourceFiles: {
        [`uploads/${safeBaseName}.${extension || "txt"}`]: text,
      },
    };
  }

  throw new Error("Unsupported file type. Use PDF, TXT, MD, PNG, JPG, or WEBP.");
}

export function deriveFallbackTitle(topic: string, fileFallbackTitle?: string): string {
  if (topic) {
    return topic.length > 48 ? `${topic.slice(0, 45).trim()}...` : topic;
  }

  return fileFallbackTitle || "Uploaded Notes";
}

function sanitizeFileStem(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "").trim();
  const compact = withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return compact || "uploaded-notes";
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function fileToDataUrl(file: File): Promise<string> {
  const mimeType = file.type || "application/octet-stream";
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function normalizePdf(file: File, safeBaseName: string): Promise<UploadPayload> {
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });

  try {
    const sourceFiles: Record<string, string> = {};

    const textResult = await parser.getText({ partial: [1] });
    const firstPageText = normalizeWhitespace(textResult.text ?? "");
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
      throw new Error("The first page of the PDF could not be read.");
    }

    return {
      fallbackTitle: safeBaseName,
      sourceFiles,
    };
  } finally {
    await parser.destroy();
  }
}
