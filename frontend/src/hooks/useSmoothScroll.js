import { useCallback } from "react";

export function useSmoothScroll(offset = 0) {
  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: noMotion ? "auto" : "smooth" });
  }, [offset]);

  return { scrollToId };
}
