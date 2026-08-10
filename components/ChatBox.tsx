"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Message = { user: string; text: string };
type HistoryTurn = { role: string; content: string };

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
    setMessages((prev) => [...prev, { user: "You", text }] );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: text, history }),
      });

      const data = await res.json();
      const reply = data.bot_reply ?? "No response.";

      setMessages((prev) => [...prev, { user: "Bot", text: reply }]);
      if (data.history) setHistory(data.history);
    } catch {
      setMessages((prev) => [
        ...prev,
        { user: "Bot", text: "Something went wrong — try again." },
      ]);
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
