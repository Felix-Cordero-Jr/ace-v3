// src/app/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import styles from "./chat.module.css";

// Message type (role: user or assistant)
type Msg = { role: "user" | "assistant"; content: string };

// Response type from API
interface ChatResponse {
  answer?: string;
  error?: string;
  status?: number;
  body?: unknown;
}

export default function ChatPage() {
  const [value, setValue] = useState(""); // Current input value
  const [loading, setLoading] = useState(false); // Loading state
  const [messages, setMessages] = useState<Msg[]>([]); // Conversation
  const [showChat, setShowChat] = useState(false); // Chat visibility
  const endRef = useRef<HTMLDivElement | null>(null); // Scroll anchor

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Reveal chat when user interacts
  function revealChat() {
    if (!showChat) setShowChat(true);
  }

  // Handle form submit (user sends message)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = value.trim();
    if (!query || loading) return;

    revealChat();
    setMessages((m) => [...m, { role: "user", content: query }]);
    setValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      let data: ChatResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Bad JSON from /api/chat (status ${res.status})`);
      }

      if (!res.ok || data?.error) {
        // If API failed
        const msg =
          `Error: ${data?.error || "Request failed"}` +
          (data?.status ? ` (${data.status})` : "") +
          (data?.body
            ? ` — ${
                typeof data.body === "string"
                  ? data.body
                  : JSON.stringify(data.body)
              }`
            : "");
        setMessages((m) => [...m, { role: "assistant", content: msg }]);
      } else {
        // Normal assistant response
        setMessages((m) => [
          ...m,
          { role: "assistant", content: String(data.answer ?? "") },
        ]);
      }
    } catch (err) {
      // Network or other errors
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `There was an error contacting the assistant. ${String(
            err
          )}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.hero}>
      {/* Redirect if not signed in */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* Show chat if signed in */}
      <SignedIn>
        <section className={styles.stage}>
          {/* Chat card (hidden until input interaction) */}
          <div
            className={`${styles.card} ${
              showChat ? styles.cardVisible : styles.cardHidden
            }`}
            aria-hidden={!showChat}
            aria-live="polite"
          >
            {/* Mascot Image */}
            <Image
              src="/ghost.png"
              alt="Ace mascot"
              width={84}
              height={84}
              className={styles.ghost}
              priority
            />

            {/* Transcript Area */}
            <div className={styles.transcript}>
              {messages.length === 0 && !loading && (
                <p className={styles.placeholder}>
                  This is for the question and response area.
                </p>
              )}

              <div className={styles.messages}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.msg} ${
                      m.role === "user" ? styles.user : styles.bot
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className={`${styles.msg} ${styles.bot}`}>…</div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Feedback Buttons */}
            <div className={styles.feedback}>
              <button type="button" className={styles.iconBtn} aria-label="Thumbs up">
                <span className={`${styles.thumb} ${styles.up}`} />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Thumbs down">
                <span className={`${styles.thumb} ${styles.down}`} />
              </button>
            </div>
          </div>

          {/* Input dock (starts centered, moves to bottom after reveal) */}
          <form
            className={`${styles.inputDock} ${
              showChat ? styles.dockBottom : styles.dockCenter
            }`}
            onSubmit={onSubmit}
            onClick={revealChat}
            aria-expanded={showChat}
          >
            <input
              className={styles.input}
              type="text"
              placeholder="What else can I support you with?"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={revealChat}
              disabled={loading}
            />
          </form>
        </section>
      </SignedIn>
    </main>
  );
}
