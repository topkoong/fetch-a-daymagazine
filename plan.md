# Product Growth Plan — Cursor-Executable Patch

> This document is a targeted patch on top of your existing `plan.md`.
> It does NOT replace the plan — it fixes the 6 failure modes that make Cursor ineffective.
> Apply each section as a direct replacement to the corresponding part of `plan.md`.

---

## Fix 1 — Corrected Execution Order

**Replace the current "Execution Order" section at the bottom with this:**

The current order (Achievement 8 → 9) is wrong. You're optimising crawlability before the page converts.
SEO traffic on a page that doesn't persuade is wasted crawl budget.

```
Execution order (from now):

1. Achievement 4    ← FINISH THIS FIRST (hero, CTA, homepage hierarchy)
2. Achievement 5.1  ← topic landing pages (SEO depth, uses internal links)
3. Fix: GitHub Pages routing (BLOCKER — see Fix 3 below)
4. Achievement 8    ← sitemap + robots.txt (only valuable once pages work)
5. Achievement 9    ← content depth + trust signals
```

**Why:** Achievement 4 is still "In Progress" — your homepage has no clear CTA.
Sending Google to a page that doesn't convert is actively counter-productive.

---

## Fix 2 — File-Level Targets for Every Achievement

Cursor cannot act on "upgrade CTA text in Home hero" — it needs a file path.
Add this table directly underneath the scope list of each achievement.

### Achievement 4 file targets

```
Files Cursor must touch:
- src/components/Hero/Hero.tsx          ← headline + subheadline + primary CTA
- src/components/Hero/Hero.module.css   ← spacing, font-size, button styles
- src/components/PostCard/PostCard.tsx  ← card CTA button label + href
- src/constants/copy.ts                 ← (create if absent) all CTA strings live here
- src/constants/links.ts                ← (create if absent) all external URLs live here
```

### Achievement 5 / 5.1 file targets

```
Files Cursor must touch:
- src/pages/About.tsx           ← new page
- src/pages/Collections.tsx     ← new page
- src/pages/Insights.tsx        ← new page
- src/pages/topics/[slug].tsx   ← dynamic topic page (or static per topic)
- src/router.tsx (or App.tsx)   ← add new routes
- src/hooks/useSeo.ts           ← extend with per-route metadata
- src/components/Navbar/Navbar.tsx ← add nav links to new pages
```

### Achievement 8 file targets

```
Files Cursor must touch/create:
- public/sitemap.xml    ← static for now; list all known routes
- public/robots.txt     ← allow all, point to sitemap
- public/404.html       ← CRITICAL: copy of index.html for GH Pages SPA routing
```

---

## Fix 3 — GitHub Pages SPA Routing (CRITICAL BLOCKER)

**Add this as a standalone Achievement 3.5 — it must run BEFORE any new routes ship.**

Every route added in Achievement 5 (`/about`, `/collections`, `/posts/:id`) will return
a hard 404 on GitHub Pages when the user lands on or refreshes the URL directly.
This is a platform constraint: GH Pages serves files, not a Node server.

### Two options — pick one and commit to it

#### Option A — HashRouter (simplest, no build change needed)

```tsx
// src/main.tsx — change BrowserRouter to HashRouter
import { HashRouter } from 'react-router-dom';

root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
```

URLs become `/#/about`, `/#/posts/123`. Not ideal for SEO but works perfectly.
Use this if the site is primarily for users, not search engines.

#### Option B — 404.html redirect trick (keeps clean URLs, SEO-friendly)

```bash
# vite.config.ts — add to build.rollupOptions or use a Vite plugin
# After build, copy dist/index.html to dist/404.html
```

```json
// package.json scripts
"postbuild": "cp dist/index.html dist/404.html"
```

GitHub Pages serves `404.html` for any unmatched path. The SPA router then
takes over client-side and renders the correct route.

**Commit:** `fix(routing): add 404.html fallback for GitHub Pages SPA deep links`
**PR title:** `fix(routing): resolve deep-link 404s on GitHub Pages`

---

## Fix 4 — Design Token Spec (Replaces Vague "High Contrast" Language)

**Add this block to your "Content and Brand Voice Guide" section:**

Cursor must use these exact values. No arbitrary choices allowed.

```css
/* src/styles/tokens.css — create this file and import in main.tsx */

:root {
  /* Brand */
  --brand-red: #e8002d;
  --brand-red-glow: rgba(232, 0, 45, 0.35);
  --brand-dark: #111111;
  --brand-muted: #555555;

  /* Spacing (8px grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;
  --space-2xl: 96px;

  /* Typography */
  --hero-h1: clamp(2rem, 5vw, 3.5rem);
  --section-h2: clamp(1.5rem, 3vw, 2.25rem);
  --body: 1rem;
  --small: 0.875rem;

  /* Buttons */
  --btn-padding: 14px 28px;
  --btn-radius: 8px;
  --btn-font-weight: 700;
  --btn-transition: transform 0.15s ease, box-shadow 0.15s ease;
}
```

**Cursor rule:** If a PR touches any visual property (color, size, spacing), it MUST
reference a token from this file. Hardcoded hex values in component files = PR rejection.

---

## Fix 5 — Machine-Testable Acceptance Criteria

**Replace every subjective acceptance criterion with one of these patterns:**

### Bad (subjective — Cursor cannot verify)

```
✗ "Tone remains cohesive and premium"
✗ "Site feels complete and credible"
✗ "No block feels visually disconnected"
✗ "Copy conveys specific intent"
```

### Good (machine-verifiable or human-checkable in 30 seconds)

```
✓ pnpm lint passes with 0 errors
✓ pnpm build exits with code 0
✓ grep -r "click here\|read more\|learn more" src/ returns 0 matches
✓ grep -r "href=\"https://adaymagazine" src/ returns ≥ 3 matches (CTAs wired)
✓ Lighthouse mobile Performance score ≥ 80
✓ Lighthouse Accessibility score ≥ 90
✓ No <a> tag has an empty href or href="#" (dead link check)
✓ Every page route returns 200 in `pnpm preview` (not 404)
✓ document.title is unique on /, /about, /collections (run in browser console)
```

**Add this QA block to EVERY achievement:**

```markdown
### Automated checks (Cursor must run before PR)

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm build` — exits 0, no TypeScript errors
- [ ] `grep -r "click here\|read more" src/` — 0 matches

### Human checks (30-second spot check)

- [ ] Open localhost:5173 — primary CTA visible without scrolling
- [ ] Click every CTA button — opens correct adaymagazine.com URL in new tab
- [ ] Resize to 375px — no horizontal scroll, no clipped text
- [ ] Refresh /about directly — page loads (not 404)
```

---

## Fix 6 — Achievement Status Audit

**The navbar overlap (Achievement 1) is marked "Completed and merged" but the user
still reports it as broken. This means either the fix was incomplete or a later PR
regressed it.**

Add this re-verification step before starting Achievement 4:

```markdown
### Pre-Achievement 4: regression audit

Before touching any new code, Cursor must verify these "completed" items still work:

1. Navbar overlap — open site, scroll. Nav must not overlap any content. Check:
   - Desktop Chrome
   - Mobile 375px
     If broken: open a fix PR first. Commit: `fix(navbar): resolve regression in sticky positioning`

2. Internal detail flow (Achievement 2) — click any article card.
   Must open internal reader page, NOT directly open adaymagazine.com.
   If broken: open a fix PR before proceeding.

3. Typography rhythm (Achievement 3) — open homepage.
   H1 must be visually dominant. Body text must be readable at 16px.
   If regressed: open a fix PR.

Only once all three pass → begin Achievement 4 work.
```

---

## Summary: What Changes in plan.md

| Section                              | Action                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| Execution Order                      | Rewrite — Achievement 4 first, GH Pages routing fix second   |
| Each Achievement scope               | Add "Files Cursor must touch" table                          |
| New section (3.5)                    | GitHub Pages SPA routing fix — Option A or B                 |
| Content & Brand Voice Guide          | Add design tokens block with exact CSS values                |
| Each Achievement acceptance criteria | Replace subjective language with grep/lint/Lighthouse checks |
| Achievement status block             | Add pre-work regression audit before Achievement 4           |

---

## The One-Line Rule for Writing Cursor-Effective Plans

> **Every instruction must be completable by someone who has never seen your codebase
> and is not allowed to ask a follow-up question.**

If the instruction requires judgment ("make it feel premium"), it is not an instruction —
it is a wish. Convert every wish into a file path, a value, or a grep command.
