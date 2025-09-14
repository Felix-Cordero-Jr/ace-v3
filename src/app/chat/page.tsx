// src/app/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import styles from './chat.module.css';

type Msg = { role: 'user' | 'assistant'; content: string };

interface ChatResponse {
  answer?: string;
  error?: string;
  status?: number;
  body?: unknown;
}

export default function ChatPage() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showChat, setShowChat] = useState(false); // 👈 start hidden
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function revealChat() {
    if (!showChat) setShowChat(true);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = value.trim();
    if (!query || loading) return;

    revealChat();
    setMessages((m) => [...m, { role: 'user', content: query }]);
    setValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      let data: ChatResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Bad JSON from /api/chat (status ${res.status})`);
      }

      if (!res.ok || data?.error) {
        const msg =
          `Error: ${data?.error || 'Request failed'}` +
          (data?.status ? ` (${data.status})` : '') +
          (data?.body
            ? ` — ${typeof data.body === 'string' ? data.body : JSON.stringify(data.body)}`
            : '');
        setMessages((m) => [...m, { role: 'assistant', content: msg }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: String(data.answer ?? '') }]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `There was an error contacting the assistant. ${String(err)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.hero}>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <section className={styles.stage}>
          {/* Centered chat card; becomes visible after input interaction */}
          <div
            className={`${styles.card} ${showChat ? styles.cardVisible : styles.cardHidden}`}
            aria-hidden={!showChat}
            aria-live="polite"
          >
            <Image
              src="/ghost.png"
              alt="Ace mascot"
              width={84}
              height={84}
              className={styles.ghost}
              priority
            />

            <div className={styles.transcript}>
              {messages.length === 0 && !loading && (
                <p className={styles.placeholder}>This is for the question and response area.</p>
              )}

              <div className={styles.messages}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && <div className={`${styles.msg} ${styles.bot}`}>…</div>}
                <div ref={endRef} />
              </div>
            </div>

            <div className={styles.feedback}>
              <button type="button" className={styles.iconBtn} aria-label="Thumbs up">
                <span className={`${styles.thumb} ${styles.up}`} />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Thumbs down">
                <span className={`${styles.thumb} ${styles.down}`} />
              </button>
            </div>
          </div>

          {/* Input pill: starts centered, slides to bottom on reveal */}
          <form
            className={`${styles.inputDock} ${showChat ? styles.dockBottom : styles.dockCenter}`}
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
