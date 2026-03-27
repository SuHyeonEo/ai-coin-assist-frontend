"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./info-popover.module.css";

export function InfoPopover({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    function updatePosition() {
      const rect = rootRef.current?.getBoundingClientRect();

      if (!rect) return;

      const panelWidth = Math.min(220, window.innerWidth - 40);
      const left = Math.min(
        Math.max(20, rect.right - panelWidth),
        Math.max(20, window.innerWidth - panelWidth - 20),
      );

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={styles.trigger}>
      <button
        type="button"
        className={styles.button}
        data-open={open}
        aria-label="설명 보기"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              id={panelId}
              role="tooltip"
              className={styles.panel}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              {description}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
