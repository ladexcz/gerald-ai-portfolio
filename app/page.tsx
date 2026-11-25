'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Briefcase, CalendarDays, Handshake, Mail, RotateCcw, Sparkles, Wrench } from 'lucide-react';
import { Avatar, type AvatarMood } from '@/components/Avatar';
import { AvatarMessage, TypingIndicator, UserMessage } from '@/components/ChatMessage';
import { Composer } from '@/components/Composer';
import { LiquidCursor } from '@/components/LiquidCursor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LINKS } from '@/lib/links';

const SUGGESTIONS = [
  { text: 'Show me your best projects', icon: Briefcase },
  { text: 'What tools do you use?', icon: Wrench },
  { text: 'How can we collaborate?', icon: Handshake },
  { text: 'Tell me a fun fact', icon: Sparkles },
];

const textOf = (m: UIMessage) =>
  m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');

export default function Home() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat();
  const [input, setInput] = useState('');
  const [happy, setHappy] = useState(false);
  const reduce = useReducedMotion();
  const threadRef = useRef<HTMLDivElement>(null);
  const prevStatus = useRef(status);

  const started = messages.length > 0;
  const busy = status === 'submitted' || status === 'streaming';
  const last = messages[messages.length - 1];
  const waiting =
    status === 'submitted' || (status === 'streaming' && last?.role === 'assistant' && !textOf(last));

  // Smile for a moment after each finished reply.
  useEffect(() => {
    if (prevStatus.current === 'streaming' && status === 'ready') {
      setHappy(true);
      const t = setTimeout(() => setHappy(false), 2600);
      prevStatus.current = status;
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  const mood: AvatarMood = waiting ? 'thinking' : status === 'streaming' ? 'talking' : happy ? 'happy' : 'idle';

  // Keep the newest line in view while the reply streams.
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom || status === 'submitted') {
      el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [messages, status, reduce]);

  const asked = useMemo(
    () => new Set(messages.filter((m) => m.role === 'user').map(textOf)),
    [messages],
  );
  const followUps = SUGGESTIONS.filter((s) => !asked.has(s.text));

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput('');
  };

  // One orchestrated entrance: avatar, greeting, line, chips, input.
  const seq = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.15 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        };

  const chips = (list: typeof SUGGESTIONS, offset: number) =>
    list.map(({ text, icon: Icon }, i) => (
      <motion.button
        key={text}
        type="button"
        className="chip"
        onClick={() => send(text)}
        disabled={busy}
        {...seq(offset + i)}
      >
        <Icon size={16} aria-hidden="true" />
        {text}
      </motion.button>
    ));

  return (
    <LayoutGroup>
      <div className={`app ${started ? 'is-chat' : 'is-intro'}`}>
        <LiquidCursor />
        <a className="skip" href="#chat-input">
          Skip to chat
        </a>

        <header className="top wrap">
          <a className="name" href="/" aria-label="Gerald Cahanza, start over" onClick={(e) => { if (started) { e.preventDefault(); window.location.reload(); } }}>
            Gerald Cahanza
          </a>
          <nav className="top-actions" aria-label="Contact">
            <ThemeToggle />
            <a className="icon-btn" href={`mailto:${LINKS.email}`} aria-label="Email Gerald">
              <Mail size={18} aria-hidden="true" />
            </a>
            <a className="btn btn-primary" href={LINKS.calendly} target="_blank" rel="noopener noreferrer" aria-label="Book a free call">
              <CalendarDays size={16} aria-hidden="true" />
              <span>Book a free call</span>
            </a>
          </nav>
        </header>

        <main id="main" className="stage" ref={threadRef}>
          {!started ? (
            <section className="intro wrap" aria-labelledby="hello">
              <motion.div layoutId="avatar" className="intro-avatar" {...(reduce ? {} : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } })}>
                <Avatar mood={mood} size={220} />
              </motion.div>
              <motion.h1 id="hello" {...seq(1)}>
                Hey, I’m Gerald <span className="wave" aria-hidden="true">👋</span>
              </motion.h1>
              <motion.p className="lede" {...seq(2)}>
                US/AU Bookkeeper — Iligan City PH
              </motion.p>
              <div className="chips" aria-label="Suggested questions">
                {chips(SUGGESTIONS, 3)}
              </div>
              <motion.div className="intro-composer" {...seq(7)}>
                <Composer value={input} onChange={setInput} onSend={() => send(input)} onStop={stop} busy={busy} />
              </motion.div>
            </section>
          ) : (
            <section className="thread wrap" aria-label="Conversation with Gerald’s avatar">
              <motion.div layoutId="avatar" className="thread-avatar">
                <Avatar mood={mood} size={104} />
              </motion.div>
              <h1 className="sr-only">Chat with Gerald</h1>
              <div className="messages" aria-live="polite">
                {messages.map((m) => {
                  const text = textOf(m);
                  if (m.role === 'user') return <UserMessage key={m.id} text={text} />;
                  if (!text) return null;
                  return <AvatarMessage key={m.id} text={text} />;
                })}
                <AnimatePresence>{waiting && <TypingIndicator key="typing" />}</AnimatePresence>
                {error && (
                  <div className="msg-error" role="alert">
                    <p>
                      My avatar couldn’t answer just now. Try again, or reach me directly at{' '}
                      <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.
                    </p>
                    <button type="button" className="btn btn-ghost" onClick={() => regenerate()}>
                      <RotateCcw size={16} aria-hidden="true" />
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {started && (
          <div className="dock wrap">
            {!busy && followUps.length > 0 && (
              <div className="chips chips-compact" aria-label="Suggested questions">
                {chips(followUps, 0)}
              </div>
            )}
            <Composer value={input} onChange={setInput} onSend={() => send(input)} onStop={stop} busy={busy} autoFocus />
          </div>
        )}
      </div>
    </LayoutGroup>
  );
}
