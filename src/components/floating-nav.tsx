"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./floating-nav.module.css";

interface FloatingNavProps {
  currentRoute: number;
}

export function FloatingNav({ currentRoute }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const routes = [2, 8];

  return (
    <div className={styles.root}>
      {isOpen ? (
        <div className={styles.panel}>
          {routes.map((route) => (
            <Link
              key={route}
              href={`/${route}`}
              className={`${styles.routeLink} ${
                route === currentRoute ? styles.routeLinkActive : ""
              }`}
              onClick={() => setIsOpen(false)}
              aria-current={route === currentRoute ? "page" : undefined}
            >
              {route}
            </Link>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open design navigation"
      >
        {isOpen ? "x" : currentRoute}
      </button>
    </div>
  );
}
