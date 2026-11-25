'use client';

import { useEffect, useRef } from 'react';

/*
  Rainbow liquid that trails the pointer, fades when the pointer rests,
  and splashes on click. One fixed canvas behind the content, drawn at half
  resolution (the gradients are soft, so nobody sees the difference).
  The loop stops completely once everything has faded out.
*/

const SCALE = 0.5; // canvas pixels per CSS pixel
const TRAIL = 14; // blobs in the chain behind the pointer
const IDLE_MS = 900; // pointer rest before the trail starts fading
const BLOB_R = 150; // radius of the lead blob, CSS px

type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; hue: number };
type Ring = { x: number; y: number; r: number; life: number; hue: number };

export function LiquidCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * SCALE);
      canvas.height = Math.ceil(h * SCALE);
    };
    resize();

    const target = { x: w / 2, y: h / 2 };
    const trail = Array.from({ length: TRAIL }, () => ({ x: w / 2, y: h / 2 }));
    let drops: Drop[] = [];
    let rings: Ring[] = [];
    let alpha = 0; // trail strength, eases to 1 while moving and to 0 at rest
    let hue = 190; // starts on the page's cyan, then drifts round the wheel
    let lastMove = -Infinity;
    let last = 0;
    let raf = 0;
    let running = false;

    const blob = (x: number, y: number, r: number, hh: number, a: number, sat: number, lig: number) => {
      if (a <= 0.003 || r <= 1) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hh}, ${sat}%, ${lig}%, ${a})`);
      g.addColorStop(0.55, `hsla(${hh}, ${sat}%, ${lig}%, ${a * 0.45})`);
      g.addColorStop(1, `hsla(${hh}, ${sat}%, ${lig}%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (now: number) => {
      const k = Math.min(3, (now - last) / 16.667); // frame-rate independent steps
      last = now;

      const active = now - lastMove < IDLE_MS;
      alpha += ((active ? 1 : 0) - alpha) * Math.min(1, (active ? 0.14 : 0.05) * k);
      hue = (hue + 0.5 * k) % 360;

      // Spring chain: each blob chases the one in front, which gives the liquid lag.
      let lead = target;
      for (let i = 0; i < TRAIL; i++) {
        const p = trail[i];
        const f = Math.min(1, (i === 0 ? 0.3 : 0.38) * k);
        p.x += (lead.x - p.x) * f;
        p.y += (lead.y - p.y) * f;
        lead = p;
      }

      const light = document.documentElement.dataset.theme === 'light';
      // Additive light on black; plain, softer paint on white so colours stay clean.
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      const sat = light ? 92 : 100;
      const lig = light ? 64 : 56;
      const base = light ? 0.2 : 0.3;

      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (let i = TRAIL - 1; i >= 0; i--) {
        const t = i / TRAIL;
        const p = trail[i];
        blob(p.x, p.y, BLOB_R * (1 - t * 0.55), (hue + i * 24) % 360, base * alpha * (1 - t * 0.4), sat, lig);
      }

      // Splash droplets: fly out, slow down, shrink, fade.
      drops = drops.filter((d) => {
        const drag = Math.pow(0.9, k);
        d.vx *= drag;
        d.vy = d.vy * drag + 0.12 * k; // a little gravity so it reads as liquid
        d.x += d.vx * k;
        d.y += d.vy * k;
        d.life -= 0.02 * k;
        if (d.life <= 0) return false;
        blob(d.x, d.y, d.r * (0.5 + d.life * 0.5), d.hue % 360, (light ? 0.42 : 0.22) * d.life /* additive on dark: overlaps add up fast */, sat, lig);
        return true;
      });

      // Splash ring: a rainbow ripple widening from the click.
      rings = rings.filter((r) => {
        r.r += 7 * k * (0.4 + r.life);
        r.life -= 0.028 * k;
        if (r.life <= 0) return false;
        const stroke =
          typeof ctx.createConicGradient === 'function'
            ? (() => {
                const g = ctx.createConicGradient(r.hue / 57.3, r.x, r.y);
                for (let s = 0; s <= 6; s++)
                  g.addColorStop(s / 6, `hsla(${(r.hue + s * 60) % 360}, ${sat}%, ${lig}%, ${r.life * 0.8})`);
                return g;
              })()
            : `hsla(${r.hue % 360}, ${sat}%, ${lig}%, ${r.life * 0.8})`;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 6 + 18 * r.life; // thick enough to survive the CSS blur
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      if (alpha < 0.004 && !active && drops.length === 0 && rings.length === 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (reduce.matches) return;
      // Coming back from rest: start the chain at the pointer, not where it faded.
      if (alpha < 0.02) {
        for (const p of trail) {
          p.x = e.clientX;
          p.y = e.clientY;
        }
      }
      target.x = e.clientX;
      target.y = e.clientY;
      lastMove = performance.now();
      start();
    };

    const onDown = (e: PointerEvent) => {
      if (reduce.matches) return;
      const n = 20;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const s = 3 + Math.random() * 8;
        drops.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1.5,
          r: 14 + Math.random() * 26,
          life: 0.8 + Math.random() * 0.2,
          hue: hue + i * (360 / n),
        });
      }
      rings.push({ x: e.clientX, y: e.clientY, r: 8, life: 1, hue });
      if (drops.length > 120) drops = drops.slice(-120); // rapid clicking stays cheap
      onMove(e);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="liquid" aria-hidden="true" />;
}
