# Interactive Portfolio

A personal portfolio website. Its job: show the owner's work fast and make it easy for a visitor
(recruiter, client, collaborator) to get in touch.

> **Fill in before the first build** (ask the owner if unknown, don't invent):
> - Owner's discipline (e.g. product designer, front-end developer, illustrator, photographer)
> - Who the visitor is and the one main action (e.g. "Email me", "View case study", "Download CV")
> - Real material: projects, screenshots, photos, bio, links, CV
> - Stack (default below)

## Stack and structure

- Chosen stack (2026-11-25): Next.js 15 App Router + Vercel AI SDK 7 (`ai`, `@ai-sdk/react`,
  Groq or OpenAI provider), Framer Motion, lucide-react, plain CSS in `app/globals.css`.
  It is a server app, not a static export, because `app/api/chat/route.ts` streams the replies.
  Deployed on Render (`render.yaml`) or Vercel. TypeScript is pinned to 5 (Next 15 checks types
  with the TS 5 API).
- The site is a single chat screen, not sections. Gerald's facts live in `lib/prompt.ts` only;
  never let the prompt invent clients, testimonials, rates or numbers.
- `front-end-skill.md` and `taste skill.md` are reference documents for design, not site content.
  Don't load, link or ship them. The taste skill's scripts and asset kit (`gate.mjs`, `deal.mjs`,
  `assets/…`) are not in this repo, so don't call them.

## Design direction (from `front-end-skill.md`)

Work like the design lead of a studio known for giving every client its own identity. The
portfolio has to look like it belongs to this person and nobody else.

### Ground it in the subject
- The owner's discipline, materials and vocabulary drive every visual choice. A motion designer's
  portfolio and a backend engineer's portfolio should look nothing alike.
- Use real content throughout: real project names, real screenshots, real outcomes. No lorem
  ipsum and no invented clients, testimonials or numbers.

### Hero
- Open with the most characteristic thing in the owner's world: the work itself, a live demo, an
  interactive moment, or a strong type treatment. Not a mood picture.
- Avoid the default "big number + small label + stats + gradient accent" hero unless it really is
  the best option.

### Typography
- Pick typefaces on purpose, not the usual defaults (Inter, Roboto, Arial, system stack as the
  design face). One family, or two clearly different ones.
- Set a clear type scale following *The Elements of Typographic Style*, with deliberate weights,
  widths and spacing. Headline type is part of the design, not just a carrier for words.
- Keep lines under 80 characters. Serif body text gets slightly more line-height than sans.
- Avoid: accenting one word of a headline (italic, bold or colour), all-caps labels, and
  unnecessary eyebrow labels above content.

### Structure is information
- Borders, numbering, dividers and labels must carry meaning. Number things (01 / 02 / 03) only
  when the content really is a sequence (a process, a timeline).

### Motion
- One orchestrated moment (a page-load sequence or one reveal) beats scattered effects.
- No fade-and-slide-up on every section, no fade-in on scroll for every card, no parallax on text,
  no scroll-jacking, no tilt, no carousels or timed tabs.
- Motion that answers the user is welcome: hover and press states on buttons and links, a project
  thumbnail zooming slightly (1.02–1.03) inside its frame, underlines drawing in, a linked card
  lifting 2px. Keep it quiet.
- Honour `prefers-reduced-motion`: everything rests, nothing stays hidden.

### Avoid the generated-page defaults
Each of these is fine only if the brief asks for it. Otherwise don't spend a free choice on one:
1. Warm cream ground (~`#F4F1EA`) + high-contrast serif display + terracotta/clay accent
   (~`#D97757`).
2. Near-black ground with one acid-green or vermilion accent.
3. Broadsheet layout: hairline rules, zero radius, dense newspaper columns.
4. The SaaS card kit: identical rounded cards, one radius everywhere, the same soft grey shadow,
   gradient washes as decoration.
5. Template chrome: tracked ALL-CAPS eyebrows, `A · B · C` meta strings, `WORD — fragment` labels,
   `#0B0B0B`/`#111` standing in for black, monospace for small data labels, `→` added to buttons.

Also never use violet or lavender as the page's own accent, ground or gradient.

### Restraint
- Put the boldness in one place. Let one element be the memorable thing and keep the rest quiet.
- Before shipping, remove one accessory (Chanel's rule).

## Layout rules (portable parts of `taste skill.md`)

- **No captions or descriptions under images.** Project info goes in the project text, not under
  the picture. Photo or licence credits go in one footer line.
- **Every visual renders** at 1440, 1024, 768 and 390 widths: no empty frames, no broken images.
- **One idea per screen:** the hero stands alone on the first screen; each section is roughly one
  or two screens tall at 1440×900, starts with its heading at the top, and doesn't show the next
  section's heading peeking in.
- **Equal left and right content edges:** everything sits on one wrapper or grid. Nothing drifts to
  one side, and the page never scrolls sideways.
- **Real icons:** a known tool's real logo (Figma, React, etc.), never a hand-drawn look-alike.
- **One system:** one button pair, one card style, one radius scale, one link style, one heading
  scale. Boxes nest two levels deep at most.
- **Mobile:** one column at 390px, buttons full width, a full-screen menu, tap targets at least
  44px, nothing overlapping and nothing past the screen edge at 320px.

## Process for every design task

1. **Plan first** (in the reply, before code):
   - Colour: 4–6 named hex values.
   - Type: the typefaces and what each is for.
   - Layout: one sentence per section plus ASCII wireframes; say how content aligns.
   - Principles: what makes this portfolio unlike any other.
2. **Review the plan against the brief.** If any part reads like the default you'd produce for any
   portfolio, revise it and say what changed and why.
3. **Build.** Watch CSS specificity. Type selectors (`section`) and class selectors (`.cta`)
   cancelling each other's padding and margins is a common bug.
4. **Critique.** Take screenshots at 1440, 1024, 768 and 390 when possible, compare them with the
   plan and fix what's off.

## Copy

- Words are there to make the page easier to understand and use. Decide what each element must
  say before writing it.
- Write for the visitor in plain language: what the project was, what the owner did, what changed.
  Be specific instead of clever.
- Active voice, sentence case, no filler. A button says exactly what happens: "Email me" or
  "Download CV", not "Submit" or "Learn more". An action keeps the same name throughout ("Send
  message" leads to "Message sent").
- Errors say what went wrong and how to fix it, without apologising. Empty states invite an action.
- Never invent facts, clients, quotes or metrics. Mark anything assumed and confirm it with the
  owner.

## Quality floor (don't announce it, just meet it)

- Responsive down to 320px.
- Visible keyboard focus; a skip link is the first Tab stop; no `tabindex` above 0.
- Every control has a name, every image has `alt`, form fields have visible labels, and headings
  go down one level at a time.
- Text contrast passes WCAG AA.
- Head: `lang`, title, meta description, Open Graph/share tags, favicon, theme-color.
- Performance: compressed images at the right size (WebP/AVIF), fonts preloaded and subset, no
  layout shift.

## Privacy

- Contact by email link or a form. No phone number, home address or exact location on the page
  unless the owner explicitly asks for it. A city or region is enough.
- Don't put personal details in requests to outside services.
