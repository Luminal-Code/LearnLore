"use client";

import { DM_Serif_Display, Nunito } from "next/font/google";
import { useState } from "react";

import { FloatingNav } from "@/components/floating-nav";
import styles from "@/components/design-two.module.css";
import { concepts } from "@/lib/mock/concepts";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export function DesignTwo() {
  const [selected, setSelected] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const activeConcept = concepts[selected];

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
            onClick={() => setShowNew(true)}
          >
            ✦ New Concept
          </button>
        </div>

        <div className={styles.recentLabelWrap}>
          <span className={styles.recentLabel}>Recent</span>
        </div>

        <div className={styles.conceptList}>
          {concepts.map((concept, index) => (
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
              Type a concept or upload your study material: PDFs, text, or photos of
              notes.
            </p>
            <input
              type="text"
              placeholder="What would you like to learn?"
              className={styles.textInput}
            />
            <div className={styles.dropZone}>
              <p className={styles.dropEmoji}>🌱</p>
              <p className={styles.dropTitle}>Drop your files here</p>
              <p className={styles.dropMeta}>PDF · TXT · PNG · JPG</p>
            </div>
            <button type="button" className={styles.generateButton}>
              Generate Story ✦
            </button>
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
              <div className={styles.hookList}>
                {activeConcept.hooks.map((memory) => (
                  <div key={`${activeConcept.id}-${memory.hook}`} className={styles.hookRow}>
                    <span className={styles.hookTitle}>{memory.hook}</span>
                    <span className={styles.hookTarget}>{memory.target}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <FloatingNav currentRoute={2} />
    </div>
  );
}
