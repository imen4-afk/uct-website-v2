"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Message = { user: string; text: string };
type HistoryTurn = { role: string; content: string };

const HISTORY_SENTINEL = "###UCT_HISTORY###";
const TYPING_PLACEHOLDER = "Bot is typing...";

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select()
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(
          data.flatMap((m: any) => [
            { user: "You", text: m.user_message },
            { user: "Bot", text: m.bot_reply ?? "" },
          ])
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { user: "You", text },
      { user: "Bot", text: TYPING_PLACEHOLDER },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: text, history }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        const sentinelIndex = raw.indexOf(HISTORY_SENTINEL);
        const displayText = sentinelIndex === -1 ? raw : raw.slice(0, sentinelIndex);

        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { user: "Bot", text: displayText || TYPING_PLACEHOLDER };
          return next;
        });
      }

      const sentinelIndex = raw.indexOf(HISTORY_SENTINEL);
      if (sentinelIndex !== -1) {
        const historyJson = raw.slice(sentinelIndex + HISTORY_SENTINEL.length);
        try {
          setHistory(JSON.parse(historyJson));
        } catch {}
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { user: "Bot", text: "Something went wrong — try again." };
        return next;
      });
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div>
      <div style={{ height: 300, overflowY: "auto" }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((m, i) => (
            <p key={i}>
              <b>{m.user}:</b> {m.text}
            </p>
          ))
        )}
        {sending && (
          <p>
            <b>Bot:</b> <i>typing…</i>
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a message..."
        disabled={sending}
      />
      <button onClick={sendMessage} disabled={sending}>
        {sending ? "..." : "Send"}
      </button>
    </div>
  );
}
