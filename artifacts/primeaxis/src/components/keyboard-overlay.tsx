import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["/"], label: "Focus search" },
  { keys: ["g", "h"], label: "Go home" },
  { keys: ["g", "r"], label: "Go to reviews" },
  { keys: ["g", "v"], label: "Go to videos" },
  { keys: ["g", "n"], label: "Go to newsletters" },
  { keys: ["t"], label: "Toggle theme" },
  { keys: ["?"], label: "Show this overlay" },
];

export function KeyboardOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <ul className="mt-4 space-y-2.5 text-sm">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between">
              <span className="text-foreground/80">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded border hairline bg-card px-1.5 font-mono text-[11px]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
