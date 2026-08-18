import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { chatApi, type ChatTurn } from "../api/chat";
import { ApiError } from "../api/client";
import { PageHeader } from "../components/PageState";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

let idCounter = 0;

const SUGGESTIONS = [
  "What's the status of order #3?",
  "Do you have any lipsticks in stock?",
  "I'd like a refund for my last order.",
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: "var(--text-muted)",
            animation: `typing-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++idCounter,
      role: "assistant",
      content:
        "Hi! I'm your store's AI assistant. Ask me about orders, products, or refunds — I'll remember what we've talked about as we go.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // Snapshot the conversation so far (before this new message) as history.
    const history: ChatTurn[] = messages
      .filter((m) => !m.error)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        text: m.content,
      }));

    setMessages((prev) => [...prev, { id: ++idCounter, role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const { reply } = await chatApi.send(text, history);
      setMessages((prev) => [
        ...prev,
        { id: ++idCounter, role: "assistant", content: reply },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong reaching the AI.";
      setMessages((prev) => [
        ...prev,
        { id: ++idCounter, role: "assistant", content: message, error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="AI Assistant"
        subtitle="Talks to your store's Gemini-powered support agent."
      />

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={
                    m.role === "assistant"
                      ? { backgroundImage: "var(--accent-gradient)" }
                      : { background: "var(--surface-hover)", border: "1px solid var(--border)" }
                  }
                >
                  {m.role === "assistant" ? (
                    <Bot size={15} className="text-white" />
                  ) : (
                    <User size={15} style={{ color: "var(--text-secondary)" }} />
                  )}
                </div>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === "user"
                      ? {
                          backgroundImage: "var(--accent-gradient)",
                          color: "white",
                          borderTopRightRadius: 4,
                        }
                      : {
                          background: "var(--bg-elevated)",
                          border: `1px solid ${m.error ? "var(--danger)" : "var(--border)"}`,
                          color: m.error ? "var(--danger)" : "var(--text-primary)",
                          borderTopLeftRadius: 4,
                        }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundImage: "var(--accent-gradient)" }}
                >
                  <Bot size={15} className="text-white" />
                </div>
                <div
                  className="flex items-center rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderTopLeftRadius: 4,
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            {messages.length === 1 && !sending && (
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    <Sparkles size={11} style={{ color: "var(--accent-violet)" }} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t px-4 py-3 sm:px-6"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about an order, a product, anything…"
            className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95 disabled:opacity-40"
            style={{ backgroundImage: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}