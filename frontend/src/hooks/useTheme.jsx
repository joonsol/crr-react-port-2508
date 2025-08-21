// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export function useTheme() {
  const KEY = "theme";
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")) };
}
