import { useMemo, useState } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";
import type { ArticleBlock } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Summarize this in one paragraph",
  "Who is this most relevant to?",
  "What changed compared to before?",
  "What should I watch for next?",
];

function blocksToParagraphs(blocks: ArticleBlock[]): string[] {
  return blocks
    .filter((b) => b.type === "paragraph" || b.type === "quote")
    .map((b) => b.content);
}

function score(query: string, paragraph: string): number {
  const qWords = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const pWords = paragraph.toLowerCase();
  let s = 0;
  for (const w of qWords) {
    if (w.length < 3) continue;
    if (pWords.includes(w)) s += 1;
  }
  return s;
}

export function AiAsk({
  title,
  body,
  aiSummary,
  keyTakeaways,
}: {
  title: string;
  body: ArticleBlock[];
  aiSummary: string;
  keyTakeaways: string[];
}) {
  const paragraphs = useMemo(() => blocksToParagraphs(body), [body]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const ask = (raw: string) => {
    const q = raw.trim();
    if (!q || pending) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setPending(true);

    setTimeout(() => {
      let answer = "";
      const lower = q.toLowerCase();
      if (
        /summar(y|ize|ise)|tldr|tl;dr|brief|overview/.test(lower)
      ) {
        answer = aiSummary;
      } else if (/takeaway|key point|highlight|bullet/.test(lower)) {
        answer =
          "Key takeaways from this story:\n\n" +
          keyTakeaways.map((t) => `• ${t}`).join("\n");
      } else {
        const ranked = paragraphs
          .map((p) => ({ p, s: score(q, p) }))
          .filter((r) => r.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 2)
          .map((r) => r.p);
        if (ranked.length > 0) {
          answer = ranked.join("\n\n");
        } else {
          answer = `Based on the article: ${aiSummary}`;
        }
      }
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
      setPending(false);
    }, 350);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border hairline bg-card/60 p-6"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Ask the article
      </div>
      <h3 className="mt-2 font-display text-xl font-bold leading-tight">
        Talk to "{title.slice(0, 60)}{title.length > 60 ? "…" : ""}"
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        A lightweight article helper searches this story's summary, takeaways,
        and body text for relevant context.
      </p>

      {messages.length === 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border hairline bg-card px-3 py-1.5 text-xs hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 max-h-96 space-y-4 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {m.content}
                </div>
              </motion.div>
            ))}
            {pending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary/60"
                      style={{
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-5 flex items-center gap-2 rounded-full border hairline bg-background px-2 py-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this story…"
          className="flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || pending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
      <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Local helper. Answers are excerpts or summaries from this article.
      </div>
    </motion.div>
  );
}
