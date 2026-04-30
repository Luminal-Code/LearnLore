"use client";

import { DM_Serif_Display, Nunito } from "next/font/google";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { FloatingNav } from "@/components/floating-nav";
import styles from "@/components/design-two.module.css";
import { concepts, type Concept } from "@/lib/mock/concepts";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type GenerateConceptResponse = {
  data?: {
    concept: Concept;
  };
  error?: string;
};

export default function Home() {
  const [conceptItems, setConceptItems] = useState<Concept[]>(concepts);
  const [selected, setSelected] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConcept = conceptItems[selected] ?? conceptItems[0];
  const canGenerate = Boolean(topic.trim() || selectedFile) && !isGenerating;

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic && !selectedFile) {
      setGenerationError("Add a topic or upload a note first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const formData = new FormData();
      if (trimmedTopic) {
        formData.set("topic", trimmedTopic);
      }

      if (selectedFile) {
        formData.set("file", selectedFile);
      }

      const response = await fetch("/api/learnlore/generate", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as GenerateConceptResponse;

      if (!response.ok || !body.data?.concept) {
        throw new Error(body.error || "Failed to generate your story.");
      }

      setConceptItems((current) => [body.data.concept, ...current]);
      setSelected(0);
      setShowNew(false);
      setTopic("");
      clearFile();
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Failed to generate your story.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setGenerationError(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`${nunito.className} ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>🌱</div>
          <span className={`${dmSerif.className} ${styles.brandName}`}>LearnLore</span>
        </div>

        <div className={styles.sidebarSection}>
          <button
            type="button"
            className={styles.newButton}
            disabled={isGenerating}
            onClick={() => {
              setShowNew(true);
              setGenerationError(null);
            }}
          >
            ✦ New Concept
          </button>
        </div>

        <div className={styles.recentLabelWrap}>
          <span className={styles.recentLabel}>Recent</span>
        </div>

        <div className={styles.conceptList}>
          {conceptItems.map((concept, index) => (
            <button
              key={concept.id}
              type="button"
              className={`${styles.conceptItem} ${
                index === selected && !showNew ? styles.conceptItemSelected : ""
              }`}
              onClick={() => {
                setSelected(index);
                setShowNew(false);
              }}
            >
              <span className={styles.conceptEmoji}>{concept.emoji}</span>
              <span className={styles.conceptMeta}>
                <span className={styles.conceptTitle}>{concept.title}</span>
                <span className={styles.conceptDate}>{concept.date}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className={styles.main}>
        {showNew ? (
          <div className={`${styles.panel} ${styles.panelWide}`}>
            <h2 className={`${dmSerif.className} ${styles.newIdeaTitle}`}>Plant a new idea</h2>
            <p className={styles.newIdeaCopy}>
              Type a topic or upload one page of notes. PDFs use the first page only.
            </p>

            <form className={styles.composerForm} onSubmit={handleGenerate}>
              <input
                type="text"
                value={topic}
                placeholder="What would you like to learn?"
                className={styles.textInput}
                disabled={isGenerating}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setGenerationError(null);
                }}
              />

              <label htmlFor="study-file" className={styles.dropZone}>
                <p className={styles.dropEmoji}>🌱</p>
                <p className={styles.dropTitle}>Upload a note or snapshot</p>
                <p className={styles.dropMeta}>PDF · TXT · MD · PNG · JPG · WEBP</p>
                <span className={styles.fileButton}>Choose file</span>
              </label>

              <input
                ref={fileInputRef}
                id="study-file"
                type="file"
                accept=".pdf,.txt,.md,image/png,image/jpeg,image/webp"
                className={styles.fileInput}
                disabled={isGenerating}
                onChange={handleFileChange}
              />

              <p className={styles.helperText}>
                Stories and memory hooks are generated together in one response.
              </p>

              {selectedFile ? (
                <div className={styles.selectedFile}>
                  <span className={styles.selectedFileName}>{selectedFile.name}</span>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isGenerating}
                    onClick={clearFile}
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {isGenerating ? (
                <div className={styles.statusCard}>
                  <p className={styles.eyebrow}>✦ Generating</p>
                  <p className={styles.statusText}>
                    Reading the material, writing the story, and extracting memory hooks in
                    one pass.
                  </p>
                </div>
              ) : null}

              {generationError ? <p className={styles.formError}>{generationError}</p> : null}

              <button type="submit" className={styles.generateButton} disabled={!canGenerate}>
                {isGenerating ? "Generating..." : "Generate Story ✦"}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.titleRow}>
              <span className={styles.titleEmoji}>{activeConcept.emoji}</span>
              <span className={styles.titleDate}>{activeConcept.date}</span>
            </div>
            <h2 className={`${dmSerif.className} ${styles.heading}`}>{activeConcept.title}</h2>

            <section className={styles.card}>
              <p className={styles.eyebrow}>✦ Story</p>
              <p className={styles.story}>{activeConcept.story}</p>
            </section>

            <section className={styles.card}>
              <p className={styles.eyebrow}>✦ Memory Hooks</p>
              {activeConcept.hooks.length > 0 ? (
                <div className={styles.hookList}>
                  {activeConcept.hooks.map((memory) => (
                    <div key={`${activeConcept.id}-${memory.hook}`} className={styles.hookRow}>
                      <span className={styles.hookTitle}>{memory.hook}</span>
                      <span className={styles.hookTarget}>{memory.target}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.story}>No memory hooks were returned for this concept.</p>
              )}
            </section>
          </div>
        )}
      </main>

      <FloatingNav currentRoute={2} />
    </div>
  );
}
