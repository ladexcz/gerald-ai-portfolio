'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';

export type AvatarMood = 'idle' | 'thinking' | 'talking' | 'happy';

/*
 * Frames come from avatar.mp4 (public/avatar-frames/frame_XXXX.webp, 1920x1080),
 * cropped to a 480px square in public/avatar-frames/480/.
 *   20       resting, looking at the visitor (shown first, before JS runs)
 *   24-35    a blink
 *   36-88    the gaze and head turning toward screen-right, a little more each frame
 * The video only turns one way, so the left side is the same frames mirrored.
 */
const REST = 20;
const BLINK_FROM = 24;
const BLINK_TO = 35;
const TURN_FROM = 36;
const TURN_TO = 88;
const RES = 480;
const DEAD_ZONE = 0.08; // pointer this close to the avatar's centre line: look straight ahead
const FADE_MS = 180; // cross-fade when the image flips between left and right
const BLINK_MS = 33; // one frame of the 30 fps source

const src = (n: number) => `/avatar-frames/480/frame_${String(n).padStart(4, '0')}.webp`;

type Shot = { frame: number; mirror: boolean };

export function Avatar({ mood, size }: { mood: AvatarMood; size: number }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const head = headRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !head || !ctx) return;

    let alive = true;
    let raf = 0;
    const imgs = new Map<number, HTMLImageElement>();

    // Pointer position: x in [-1, 1] across the screen from the avatar's centre, y likewise.
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    let blinkStart = -1;
    let nextBlink = performance.now() + 2500 + Math.random() * 3000;
    let shown: Shot = { frame: REST, mirror: false };
    let fadeFrom: Shot | null = null;
    let fadeStart = 0;
    let drawn = false;

    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        targetX = 0;
        targetY = 0;
      }
    };

    const shotFor = (p: number): Shot => {
      const a = Math.abs(p);
      if (a < DEAD_ZONE) return { frame: REST, mirror: false };
      const t = (a - DEAD_ZONE) / (1 - DEAD_ZONE);
      return { frame: TURN_FROM + Math.round(t * (TURN_TO - TURN_FROM)), mirror: p < 0 };
    };

    const paint = (s: Shot, alpha: number) => {
      const img = imgs.get(s.frame) ?? imgs.get(REST);
      if (!img) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (s.mirror) ctx.setTransform(-1, 0, 0, 1, RES, 0);
      ctx.drawImage(img, 0, 0, RES, RES);
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!alive) return;
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.1;

      const want = shotFor(x);

      // Blink now and then, only while looking straight ahead.
      if (want.frame === REST) {
        if (blinkStart < 0 && now > nextBlink) blinkStart = now;
        if (blinkStart >= 0) {
          const i = Math.floor((now - blinkStart) / BLINK_MS);
          if (i <= BLINK_TO - BLINK_FROM) want.frame = BLINK_FROM + i;
          else {
            blinkStart = -1;
            nextBlink = now + 2500 + Math.random() * 3500;
          }
        }
      } else if (blinkStart >= 0) {
        blinkStart = -1;
        nextBlink = now + 1500 + Math.random() * 2000;
      }

      if (want.mirror !== shown.mirror) {
        fadeFrom = shown;
        fadeStart = now;
      }

      const fading = fadeFrom && now - fadeStart < FADE_MS;
      if (!drawn || fading || want.frame !== shown.frame || want.mirror !== shown.mirror) {
        ctx.clearRect(0, 0, RES, RES);
        if (fadeFrom && fading) {
          paint(fadeFrom, 1);
          paint(want, (now - fadeStart) / FADE_MS);
        } else {
          fadeFrom = null;
          paint(want, 1);
        }
        drawn = true;
      }
      shown = want;

      // A small nod toward the pointer, on top of the turn the frames show.
      // scale(1.06) keeps the frame's edges out of the circle while it moves.
      head.style.transform = `translate3d(${x * 3}px, ${y * 4}px, 0) rotate(${x * 2.5 - y * x * 1.5}deg) scale(1.06)`;

      raf = requestAnimationFrame(tick);
    };

    const frames = [REST];
    for (let n = BLINK_FROM; n <= TURN_TO; n++) frames.push(n);
    Promise.all(
      frames.map(
        (n) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src(n);
            img
              .decode()
              .then(() => imgs.set(n, img))
              .catch(() => {})
              .finally(resolve);
          }),
      ),
    ).then(() => {
      if (!alive) return;
      window.addEventListener('pointermove', onMove);
      document.addEventListener('mouseout', onLeave);
      raf = requestAnimationFrame(tick);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [reduce]);

  // Mood reads on the frame around the face: the glow pulses while thinking,
  // the avatar bobs while the reply streams in, and pops once when it is done.
  const ring: TargetAndTransition = reduce
    ? {}
    : mood === 'thinking'
      ? {
          boxShadow: [
            '0 0 0 1px rgba(60,215,255,0.35), 0 0 24px rgba(60,215,255,0.15)',
            '0 0 0 2px rgba(60,215,255,0.8), 0 0 48px rgba(60,215,255,0.4)',
            '0 0 0 1px rgba(60,215,255,0.35), 0 0 24px rgba(60,215,255,0.15)',
          ],
        }
      : mood === 'talking'
        ? { y: [0, -3, 0], boxShadow: '0 0 0 1px rgba(60,215,255,0.55), 0 0 36px rgba(60,215,255,0.25)' }
        : mood === 'happy'
          ? { scale: [1, 1.05, 1], boxShadow: '0 0 0 1px rgba(60,215,255,0.45), 0 0 32px rgba(60,215,255,0.2)' }
          : { y: 0, scale: 1, boxShadow: '0 0 0 1px rgba(60,215,255,0.3), 0 0 28px rgba(60,215,255,0.12)' };

  const ringTransition: Transition =
    mood === 'thinking'
      ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
      : mood === 'talking'
        ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
        : { duration: 0.5, ease: 'easeOut' };

  return (
    <motion.div
      className="avatar"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        mood === 'thinking'
          ? 'Gerald’s avatar, thinking'
          : mood === 'talking'
            ? 'Gerald’s avatar, replying'
            : 'Gerald’s avatar'
      }
      animate={ring}
      transition={ringTransition}
    >
      <div ref={headRef} className="avatar-head">
        {/* First paint: frame 20, before the canvas takes over */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(REST)} alt="" width={RES} height={RES} fetchPriority="high" draggable={false} />
        <canvas ref={canvasRef} width={RES} height={RES} aria-hidden="true" />
      </div>
    </motion.div>
  );
}
