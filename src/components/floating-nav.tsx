"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./floating-nav.module.css";

interface FloatingNavProps {
  currentRoute: number;
}

export function FloatingNav({ currentRoute }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.root}>
      {isOpen ? (
        <div className={styles.panel}>
          <Link
            href="/2"
            className={styles.routeLink}
            onClick={() => setIsOpen(false)}
            aria-current="page"
          >
            {currentRoute}
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open design navigation"
      >
        {isOpen ? "×" : currentRoute}
      </button>
    </div>
  );
}
