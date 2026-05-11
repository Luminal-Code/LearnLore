"use client";

import { DM_Serif_Display, Nunito } from "next/font/google";
import { useState } from "react";

import { FloatingNav } from "@/components/floating-nav";

import styles from "./design-eight.module.css";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const questions = [
  {
    id: 1,
    topic: "Geography",
    prompt: "Which line divides Earth into the Northern and Southern Hemispheres?",
    options: ["Prime Meridian", "Equator", "Tropic of Cancer", "International Date Line"],
    correct: 1,
    note: "Anchor it to the middle belt around the globe.",
  },
  {
    id: 2,
    topic: "Capitals",
    prompt: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct: 2,
    note: "This one is often confused with the biggest city.",
  },
  {
    id: 3,
    topic: "Oceans",
    prompt: "Which ocean is the largest by surface area?",
    options: ["Atlantic Ocean", "Arctic Ocean", "Indian Ocean", "Pacific Ocean"],
    correct: 3,
    note: "Think of the ocean that spans the widest map edge-to-edge.",
  },
  {
    id: 4,
    topic: "Landforms",
    prompt: "Mount Everest sits in which mountain range?",
    options: ["Andes", "Rockies", "Himalayas", "Alps"],
    correct: 2,
    note: "Pair Everest with the range stretching across Nepal and Tibet.",
  },
  {
    id: 5,
    topic: "Countries",
    prompt: "Which country is spread across the greatest number of time zones?",
    options: ["Russia", "United States", "Canada", "France"],
    correct: 3,
    note: "Overseas territories change the answer here.",
  },
] as const;

function getResultCopy(score: number) {
  if (score === questions.length) {
    return "Perfect recall. You can move straight into harder drills.";
  }

  if (score >= 4) {
    return "Strong pass. One more review round should lock this set in.";
  }

  if (score >= 3) {
    return "You have the core map in place. Review the misses before moving on.";
  }

  return "Good start. Repetition is the point here, so run it again after a short break.";
}

export function DesignEight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [showResults, setShowResults] = useState(false);

  const activeQuestion = questions[currentIndex];
  const score = answers.filter((answer, index) => answer === questions[index].correct).length;

  function handleSelect(index: number) {
    setSelected(index);
    setAnswers((current) => {
      const next = [...current];
      next[currentIndex] = index;
      return next;
    });
  }

  function handleNext() {
    if (currentIndex === questions.length - 1) {
      setShowResults(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelected(answers[nextIndex]);
  }

  function handlePrevious() {
    if (currentIndex === 0) {
      return;
    }

    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
    setSelected(answers[nextIndex]);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setShowResults(false);
  }

  return (
    <div className={`${nunito.className} ${styles.shell}`}>
      <div className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <p className={styles.eyebrow}>Route 8 - Retrieval Practice</p>
            <h1 className={`${dmSerif.className} ${styles.title}`}>
              World geography, in LearnLore form.
            </h1>
            <p className={styles.copy}>
              A short quiz built with the same calm study palette as the rest of the app.
              The goal is recall, not spectacle: answer, review, repeat.
            </p>
          </div>

          <aside className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Focused Session</span>
            <div className={styles.summaryMeta}>
              <div className={styles.summaryItem}>
                <span>Questions</span>
                <strong>{questions.length}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Mode</span>
                <strong>Multiple choice</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Current topic</span>
                <strong>{showResults ? "Review" : activeQuestion.topic}</strong>
              </div>
            </div>
            <p className={styles.summaryHint}>
              Use this as the retrieval step after reading or story generation.
            </p>
          </aside>
        </section>

        <section className={styles.content}>
          {!showResults ? (
            <div className={styles.questionCard}>
              <div className={styles.progressRow}>
                {questions.map((question, index) => {
                  const answered = answers[index] !== null;
                  const className =
                    index === currentIndex
                      ? `${styles.progressDot} ${styles.progressActive}`
                      : answered
                        ? `${styles.progressDot} ${styles.progressDone}`
                        : styles.progressDot;

                  return <span key={question.id} className={className} />;
                })}
              </div>

              <div className={styles.topicRow}>
                <span className={styles.topicTag}>{activeQuestion.topic}</span>
                <span className={styles.statusTag}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className={`${dmSerif.className} ${styles.question}`}>{activeQuestion.prompt}</h2>

              <div className={styles.options}>
                {activeQuestion.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.option} ${
                      selected === index ? styles.optionSelected : ""
                    }`}
                    onClick={() => handleSelect(index)}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  Back
                </button>
                <button type="button" className={styles.primaryButton} onClick={handleNext}>
                  {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.resultCard}>
              <p className={styles.eyebrow}>Session Result</p>
              <div className={styles.scoreRow}>
                <div>
                  <div className={`${dmSerif.className} ${styles.scoreValue}`}>
                    {Math.round((score / questions.length) * 100)}%
                  </div>
                  <p className={styles.scoreText}>
                    {score} of {questions.length} answers correct.
                  </p>
                </div>
                <div className={styles.resultBadge}>{getResultCopy(score)}</div>
              </div>

              <div className={styles.resultList}>
                {questions.map((question, index) => {
                  const correct = answers[index] === question.correct;

                  return (
                    <div
                      key={question.id}
                      className={`${styles.resultItem} ${
                        correct ? styles.resultItemCorrect : styles.resultItemMissed
                      }`}
                    >
                      <span className={styles.resultTopic}>{question.topic}</span>
                      <span className={styles.resultState}>
                        {correct ? "Correct" : "Review"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={handleRestart}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          <aside className={styles.reviewCard}>
            <h3 className={`${dmSerif.className} ${styles.reviewTitle}`}>Recall cues</h3>
            <div className={styles.reviewList}>
              {questions.map((question, index) => (
                <div key={question.id} className={styles.reviewItem}>
                  <span className={styles.reviewBullet}>{index + 1}</span>
                  <div>
                    <strong>{question.topic}</strong>
                    <span>{question.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>

      <FloatingNav currentRoute={8} />
    </div>
  );
}
