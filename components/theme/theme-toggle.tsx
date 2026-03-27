"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleThemeChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === "aica-theme") {
      onStoreChange();
    }
  };

  window.addEventListener("aica-theme-change", handleThemeChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("aica-theme-change", handleThemeChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("aica-theme", theme);
  window.dispatchEvent(new Event("aica-theme-change"));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);

  function toggleTheme() {
    const currentTheme = theme ?? readTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";
  const buttonLabel = theme == null ? "테마 전환" : isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
  const buttonText = theme == null ? "테마 전환" : isDark ? "라이트 모드" : "다크 모드";
  const buttonIcon = theme == null ? "◐" : isDark ? "☀" : "☾";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={buttonLabel}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {buttonIcon}
      </span>
      <span>{buttonText}</span>
    </button>
  );
}
