import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Square } from "lucide-react";
import type { ArticleBlock } from "@workspace/api-client-react";
import { formatDuration, withBase } from "@/lib/format";

function blocksToText(blocks: ArticleBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") {
      parts.push(b.content);
    } else if (b.type === "list" && b.items) {
      parts.push(b.items.join(". "));
    }
  }
  return parts.join("\n\n");
}

export function ListenButton({
  title,
  blocks,
  audioUrl,
  audioDurationSeconds,
}: {
  title: string;
  blocks: ArticleBlock[];
  audioUrl?: string | null;
  audioDurationSeconds?: number | null;
}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hostedAudioUrl = audioUrl ? withBase(audioUrl) : "";

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (hostedAudioUrl) {
    return (
      <div className="rounded-2xl border hairline bg-card/40 p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Headphones className="h-3.5 w-3.5 text-primary" />
          Podcast episode
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          AI-narrated audio for this story
          {audioDurationSeconds
            ? ` · ${formatDuration(audioDurationSeconds)}`
            : ""}
        </p>
        <audio
          className="mt-4 w-full"
          controls
          preload="metadata"
          src={hostedAudioUrl}
        >
          <a href={hostedAudioUrl}>Download the episode</a>
        </audio>
      </div>
    );
  }

  if (!supported) return null;

  const start = () => {
    const text = `${title}. ${blocksToText(blocks)}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /Google.*US.*English/i.test(v.name)) ||
      voices.find((v) => /Samantha|Daniel|Karen/i.test(v.name)) ||
      voices.find((v) => v.lang?.startsWith("en"));
    if (preferred) u.voice = preferred;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    utterRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setState("playing");
  };

  const pauseResume = () => {
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
    } else if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setState("idle");
  };

  return (
    <div className="rounded-2xl border hairline bg-card/40 p-5">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <Headphones className="h-3.5 w-3.5 text-primary" />
        Listen to this story
      </div>
      <div className="mt-3 flex items-center gap-2">
        {state === "idle" ? (
          <button
            onClick={start}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:scale-[1.02]"
          >
            <Play className="h-3.5 w-3.5 fill-background" />
            Play
          </button>
        ) : (
          <>
            <button
              onClick={pauseResume}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background"
            >
              {state === "playing" ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-background" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-background" />
                  Resume
                </>
              )}
            </button>
            <button
              onClick={stop}
              className="inline-flex h-10 items-center gap-2 rounded-full border hairline bg-card px-4 text-sm font-medium hover:bg-accent"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
            {state === "playing" && (
              <span className="ml-1 inline-flex items-end gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="block w-0.5 rounded-full bg-primary"
                    style={{
                      height: `${6 + (i % 2) * 8}px`,
                      animation: `eq 0.${6 + i}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </span>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes eq { from { transform: scaleY(0.5); } to { transform: scaleY(1.6); } }`}</style>
    </div>
  );
}
