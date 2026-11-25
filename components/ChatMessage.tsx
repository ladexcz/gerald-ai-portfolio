'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const external = href?.startsWith('http');
          return (
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
});

export function UserMessage({ text }: { text: string }) {
  return (
    <motion.div className="msg msg-user" {...enter}>
      <p>{text}</p>
    </motion.div>
  );
}

export function AvatarMessage({ text }: { text: string }) {
  return (
    <motion.div className="msg msg-avatar" {...enter}>
      <div className="bubble prose">
        <Markdown text={text} />
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div className="msg msg-avatar" {...enter} role="status" aria-label="Gerald is typing">
      <div className="bubble typing" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}
