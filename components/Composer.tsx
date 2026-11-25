'use client';

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Square } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  autoFocus?: boolean;
};

export function Composer({ value, onChange, onSend, onStop, busy, autoFocus }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with the text, up to a cap set in CSS.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!busy && value.trim()) onSend();
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <motion.form layoutId="composer" className="composer" onSubmit={submit}>
      <label htmlFor="chat-input" className="sr-only">
        Message Gerald’s avatar
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        rows={1}
        value={value}
        autoFocus={autoFocus}
        maxLength={1000}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="Ask about my work, tools or experience…"
      />
      {busy ? (
        <button type="button" className="send" onClick={onStop} aria-label="Stop reply">
          <Square size={16} fill="currentColor" aria-hidden="true" />
        </button>
      ) : (
        <button type="submit" className="send" disabled={!value.trim()} aria-label="Send message">
          <ArrowUp size={20} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}
    </motion.form>
  );
}
