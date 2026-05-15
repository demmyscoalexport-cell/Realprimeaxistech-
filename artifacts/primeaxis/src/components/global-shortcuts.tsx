import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";

export function GlobalShortcuts() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const lastG = useRef<number>(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/" && !e.shiftKey) {
        e.preventDefault();
        navigate("/search");
        return;
      }
      if (e.key === "t") {
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }
      if (e.key === "g") {
        lastG.current = Date.now();
        return;
      }
      if (Date.now() - lastG.current < 800) {
        const map: Record<string, string> = {
          h: "/",
          r: "/reviews",
          v: "/videos",
          n: "/newsletters",
        };
        const target = map[e.key];
        if (target) {
          e.preventDefault();
          navigate(target);
          lastG.current = 0;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, setTheme, theme]);

  return null;
}
