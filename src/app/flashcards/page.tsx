"use client";

import { DM_Serif_Display, Nunito } from "next/font/google";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { FloatingNav } from "@/components/floating-nav";
import layoutStyles from "@/components/design-two.module.css";

import styles from "./page.module.css";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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

type GenerateFlashcardsResponse = {
  data?: {
    deck: FlashcardDeck;
  };
  error?: string;
};

const gradeOptions = [
  {
    label: "Forgot",
    buttonClassName: styles.gradeButtonDanger,
    chipClassName: styles.gradeChipDanger,
  },
  {
    label: "Hard",
    buttonClassName: styles.gradeButtonWarn,
    chipClassName: styles.gradeChipWarn,
  },
  {
    label: "Good",
    buttonClassName: styles.gradeButtonSuccess,
    chipClassName: styles.gradeChipSuccess,
  },
  {
    label: "Easy",
    buttonClassName: styles.gradeButtonCalm,
    chipClassName: styles.gradeChipCalm,
  },
] as const;

export default function FlashcardsPage() {
  const [deckItems, setDeckItems] = useState<FlashcardDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [skippedCardIds, setSkippedCardIds] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDeck = deckItems.find((deck) => deck.id === selectedDeckId) ?? null;
  const activeCards = activeDeck?.cards ?? [];
  const activeCard = activeCards[cardIndex] ?? null;
  const gradedCount = Object.keys(grades).length;
  const reviewedCount = gradedCount + skippedCardIds.length;
  const progress =
    sessionComplete || activeCards.length === 0 ? 100 : (reviewedCount / activeCards.length) * 100;
  const cardsLeft = Math.max(activeCards.length - reviewedCount, 0);
  const weakestTopics = Object.entries(grades)
    .filter(([, value]) => value === "Forgot" || value === "Hard")
    .map(([id]) => activeCards.find((entry) => entry.id === Number(id))?.tag)
    .filter((value): value is string => Boolean(value));
  const weakestLabel = weakestTopics[0] ?? "None";
  const canGenerate = Boolean(notes.trim() || selectedFile) && !isGenerating;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" && !flipped && !sessionComplete && activeCard) {
        event.preventDefault();
        setFlipped(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCard, flipped, sessionComplete]);

  function resetSession() {
    setCardIndex(0);
    setFlipped(false);
    setShowDetails(false);
    setGrades({});
    setSkippedCardIds([]);
    setSessionComplete(false);
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSelectDeck(deckId: number) {
    setSelectedDeckId(deckId);
    setShowNew(false);
    setGenerationError(null);
    resetSession();
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNotes = notes.trim();
    if (!trimmedNotes && !selectedFile) {
      setGenerationError("Add study notes or upload a file first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const formData = new FormData();
      if (trimmedNotes) {
        formData.set("notes", trimmedNotes);
      }

      if (selectedFile) {
        formData.set("file", selectedFile);
      }

      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as GenerateFlashcardsResponse;

      if (!response.ok || !body.data?.deck) {
        throw new Error(body.error || "Failed to generate your flashcards.");
      }

      setDeckItems((current) => [body.data!.deck, ...current]);
      setSelectedDeckId(body.data.deck.id);
      setShowNew(false);
      setNotes("");
      clearFile();
      resetSession();
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Failed to generate your flashcards.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setGenerationError(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  function moveToNextCard() {
    if (cardIndex === activeCards.length - 1) {
      setSessionComplete(true);
      setFlipped(false);
      setShowDetails(false);
      return;
    }

    setCardIndex((previousIndex) => previousIndex + 1);
    setFlipped(false);
    setShowDetails(false);
  }

  function handleGrade(grade: string) {
    if (!activeCard) {
      return;
    }

    setGrades((previousGrades) => ({
      ...previousGrades,
      [activeCard.id]: grade,
    }));

    moveToNextCard();
  }

  function handleSkip() {
    if (!activeCard) {
      return;
    }

    setSkippedCardIds((previousIds) =>
      previousIds.includes(activeCard.id) ? previousIds : [...previousIds, activeCard.id],
    );

    moveToNextCard();
  }

  return (
    <div className={`${nunito.className} ${layoutStyles.shell}`}>
      <aside className={layoutStyles.sidebar}>
        <div className={layoutStyles.brand}>
          <div className={layoutStyles.brandMark}>🌱</div>
          <span className={`${dmSerif.className} ${layoutStyles.brandName}`}>LearnLore</span>
        </div>

        <div className={layoutStyles.sidebarSection}>
          <button
            type="button"
            className={layoutStyles.newButton}
            disabled={isGenerating}
            onClick={() => {
              setShowNew(true);
              setGenerationError(null);
              resetSession();
            }}
          >
            ✦ New Flashcards
          </button>
        </div>

        <div className={layoutStyles.recentLabelWrap}>
          <span className={layoutStyles.recentLabel}>Recent</span>
        </div>

        <div className={layoutStyles.conceptList}>
          {deckItems.length === 0 ? (
            <div className={styles.emptyRecent}>No flashcard decks yet.</div>
          ) : (
            deckItems.map((deck) => (
              <button
                key={deck.id}
                type="button"
                className={`${layoutStyles.conceptItem} ${
                  deck.id === selectedDeckId && !showNew ? layoutStyles.conceptItemSelected : ""
                }`}
                onClick={() => handleSelectDeck(deck.id)}
              >
                <span className={layoutStyles.conceptEmoji}>{deck.emoji}</span>
                <span className={layoutStyles.conceptMeta}>
                  <span className={layoutStyles.conceptTitle}>{deck.title}</span>
                  <span className={layoutStyles.conceptDate}>{deck.date}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className={layoutStyles.main}>
        {showNew || !activeDeck ? (
          <div className={`${layoutStyles.panel} ${layoutStyles.panelWide}`}>
            <h2 className={`${dmSerif.className} ${layoutStyles.newIdeaTitle}`}>
              Build a new deck
            </h2>
            <p className={layoutStyles.newIdeaCopy}>
              Paste study notes or upload one page of material. PDFs use the first page only.
            </p>

            <form className={layoutStyles.composerForm} onSubmit={handleGenerate}>
              <textarea
                value={notes}
                placeholder="Paste the notes you want converted into flashcards..."
                className={styles.notesInput}
                disabled={isGenerating}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setGenerationError(null);
                }}
              />

              <label htmlFor="flashcard-file" className={layoutStyles.dropZone}>
                <p className={layoutStyles.dropEmoji}>🧠</p>
                <p className={layoutStyles.dropTitle}>Upload a note, slide, or snapshot</p>
                <p className={layoutStyles.dropMeta}>PDF · TXT · MD · PNG · JPG · WEBP</p>
                <span className={layoutStyles.fileButton}>Choose file</span>
              </label>

              <input
                ref={fileInputRef}
                id="flashcard-file"
                type="file"
                accept=".pdf,.txt,.md,image/png,image/jpeg,image/webp"
                className={layoutStyles.fileInput}
                disabled={isGenerating}
                onChange={handleFileChange}
              />

              <p className={layoutStyles.helperText}>
                The deck is returned in a structured format so each card can be parsed cleanly.
              </p>

              {selectedFile ? (
                <div className={layoutStyles.selectedFile}>
                  <span className={layoutStyles.selectedFileName}>{selectedFile.name}</span>
                  <button
                    type="button"
                    className={layoutStyles.secondaryButton}
                    disabled={isGenerating}
                    onClick={clearFile}
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {isGenerating ? (
                <div className={layoutStyles.statusCard}>
                  <p className={layoutStyles.eyebrow}>✦ Generating</p>
                  <p className={layoutStyles.statusText}>
                    Reading the material, extracting the key ideas, and building the review deck
                    in one pass.
                  </p>
                </div>
              ) : null}

              {generationError ? <p className={layoutStyles.formError}>{generationError}</p> : null}

              <button
                type="submit"
                className={layoutStyles.generateButton}
                disabled={!canGenerate}
              >
                {isGenerating ? "Generating..." : "Generate Flashcards ✦"}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.reviewPanel}>
            {sessionComplete ? (
              <section className={styles.summaryPanel}>
                <p className={styles.eyebrow}>Review Complete</p>
                <h2 className={`${dmSerif.className} ${styles.summaryTitle}`}>
                  You finished {activeDeck.title}
                </h2>
                <p className={styles.summaryCopy}>{activeDeck.cards.length} cards reviewed.</p>

                <div className={styles.summaryStats}>
                  <div className={styles.summaryStat}>
                    <span className={styles.statLabel}>Completion</span>
                    <span className={styles.summaryValue}>100%</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.statLabel}>Cards Graded</span>
                    <span className={styles.summaryValue}>{gradedCount}</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.statLabel}>Cards Skipped</span>
                    <span className={styles.summaryValue}>{skippedCardIds.length}</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.statLabel}>Weakest Topic</span>
                    <span className={styles.summaryValue}>{weakestLabel}</span>
                  </div>
                </div>

                <div className={styles.gradeList}>
                  {Object.entries(grades).map(([id, grade]) => {
                    const gradedCard = activeDeck.cards.find((entry) => entry.id === Number(id));
                    const option = gradeOptions.find((entry) => entry.label === grade);

                    return (
                      <span
                        key={id}
                        className={`${styles.gradeChip} ${option?.chipClassName ?? ""}`}
                      >
                        {gradedCard?.tag}: {grade}
                      </span>
                    );
                  })}

                  {skippedCardIds.length > 0 ? (
                    <span className={styles.gradeChipNeutral}>Skipped: {skippedCardIds.length}</span>
                  ) : null}
                </div>

                <p className={styles.summaryNote}>{activeDeck.summary}</p>

                <button type="button" className={styles.primaryButton} onClick={resetSession}>
                  Start Again
                </button>
              </section>
            ) : activeCard ? (
              <div className={styles.contentGrid}>
                <section className={styles.cardPanel}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTags}>
                      <span className={styles.tag}>{activeCard.tag}</span>
                      <span className={styles.tagMuted}>{flipped ? "Answer" : activeCard.type}</span>
                    </div>
                    <span className={styles.cardCount}>
                      Card {cardIndex + 1} of {activeCards.length}
                    </span>
                  </div>

                  {!flipped ? (
                    <>
                      <p className={styles.eyebrow}>Prompt</p>
                      <h2 className={`${dmSerif.className} ${styles.question}`}>{activeCard.front}</h2>
                      <p className={styles.helperText}>
                        Press space or use the button below to reveal.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={styles.eyebrow}>Answer</p>
                      <h2 className={`${dmSerif.className} ${styles.answer}`}>{activeCard.back}</h2>
                      <p className={styles.explanation}>{activeCard.explanation}</p>

                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setShowDetails((previous) => !previous)}
                      >
                        {showDetails ? "Hide memory hook" : "Show memory hook and source"}
                      </button>

                      {showDetails ? (
                        <div className={styles.detailsCard}>
                          <p className={styles.detailText}>{activeCard.hook}</p>
                          <p className={styles.detailMeta}>{activeCard.source}</p>
                        </div>
                      ) : null}
                    </>
                  )}

                  <div className={styles.actions}>
                    {!flipped ? (
                      <>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => setFlipped(true)}
                        >
                          Show Answer
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={handleSkip}
                        >
                          Skip
                        </button>
                      </>
                    ) : (
                      gradeOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => handleGrade(option.label)}
                          className={`${styles.gradeButton} ${option.buttonClassName}`}
                        >
                          {option.label}
                        </button>
                      ))
                    )}
                  </div>
                </section>

                <aside className={styles.infoColumn}>
                  <section className={styles.infoCard}>
                    <p className={styles.eyebrow}>Deck</p>
                    <p className={styles.infoText}>{activeDeck.summary}</p>
                    <p className={styles.progressMeta}>{Math.round(progress)}% through this pass</p>
                  </section>

                  <section className={styles.infoCard}>
                    <p className={styles.eyebrow}>Why This Card</p>
                    <p className={styles.infoText}>{activeCard.reviewReason}</p>
                  </section>

                  <section className={styles.infoCard}>
                    <p className={styles.eyebrow}>Coach</p>
                    <p className={styles.infoText}>{activeCard.coachTip}</p>
                  </section>

                  <section className={styles.infoCard}>
                    <p className={styles.eyebrow}>Session</p>
                    <div className={styles.sessionList}>
                      <span>{cardsLeft} cards left</span>
                      <span>{weakestTopics.length} weak concepts flagged</span>
                      <span>{Math.max(activeCards.length - cardIndex - 1, 0)} cards ahead</span>
                    </div>
                  </section>
                </aside>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <FloatingNav currentRoute={8} />
    </div>
  );
}
