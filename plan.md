# Product Growth Plan (High-End UI/UX + SEO + Multi-Page Editorial)

## Vision

Evolve Toppy from a single-feed interface into a premium editorial web product:

- richer narrative content
- stronger conversion copy
- route-level SEO
- multiple evergreen pages for discoverability and trust
- resilient article rendering with build-time content preparation

This document is intentionally detailed so each achievement can ship as one focused PR.

## Product Principles

1. **Editorial clarity first**: every screen helps users decide what to read next.
2. **Premium feel, not decorative clutter**: restraint, spacing rhythm, hierarchy.
3. **SEO by structure**: meaningful pages, durable URLs, route-specific metadata.
4. **Performance confidence**: resilient data sourcing and graceful fallback states.
5. **Incremental shipping discipline**: one objective per PR, measurable outcome.

## Content and Brand Voice Guide

### Voice

- Confident, calm, expert.
- Precise verbs over generic marketing filler.
- Fewer words, stronger intention.

### CTA Pattern

- Primary CTA: action + value outcome.
- Secondary CTA: low-friction exploration.
- Avoid vague text such as "click here" or "read more".

### Approved CTA examples

- "Explore curated stories now"
- "Read the full editorial story"
- "Reveal 8 more standout stories"
- "Continue to the original article"
- "Open premium collections"

---

## SEO Expansion Model

### Required SEO foundations

- Route-level `<title>`, description, canonical URL.
- Route-level Open Graph and Twitter metadata updates.
- Internal links between evergreen pages and story feeds.
- Descriptive headings (`h1`, `h2`) aligned with search intent.

### Content page set (multi-page architecture)

- `/` (Home) - primary discovery and conversion hub.
- `/about` - positioning, trust, product intent.
- `/collections` - category-index page with intent-based exploration.
- `/insights` - methodology and editorial product thinking.
- `/posts/:id` - article detail reader.
- `/posts/categories/:id` - category feed pages.

### Optional SEO phase 2

- add `sitemap.xml` and `robots.txt` in `public/`
- generate static page list for canonical management
- add FAQ content page with schema-compatible structure

---

## Build-Time Article Preparation Strategy

### Goal

Pre-fetch article detail payloads during CI/cache update pipelines so detail pages can be rendered from structured cached content first, then network fallback.

### Implementation direction

- Build cache source list from `src/assets/cached/posts.json`
- Fetch each `/wp-json/wp/v2/posts/:id`
- Persist to `src/assets/cached/post-details.json` as keyed object by id
- Update app fetch flow:
  - try cache first
  - fallback to network
- Regenerate caches in CI/deploy and scheduled cache workflows

### Success criteria

- Detail pages open with reduced wait even if source is slow.
- App remains functional if source endpoint intermittently fails.
- No TypeScript shape regressions in normalized post model.

---

## Delivery Constraints

- One achievement = one branch = one PR.
- Conventional commit format only.
- No mixed-scope PRs.
- Every PR must pass:
  - `pnpm lint`
  - `pnpm build`

---

## Achievement Tracker

## Achievement 1 - Navigation Stability and Responsiveness

**Status:** Completed and merged  
**Outcome:** Removed overlap/flicker risk in nav layout and improved breakpoint stability.

## Achievement 2 - Internal Detail Flow + Image Fallback Messaging

**Status:** Completed and merged  
**Outcome:** Users stay in-app on read intent, with graceful media fallback messaging.

## Achievement 3 - Typography Rhythm + First Render Stability

**Status:** Completed and merged  
**Outcome:** Better visual hierarchy and reduced perception of pop-in on first paint.

## Achievement 4 - Landing Hierarchy and CTA Readability

**Status:** In progress  
**Outcome target:** Home page reads like a premium publication with clearer conversion actions.

---

## Next Achievements (One PR each)

## Achievement 5 - Multi-Page Editorial Expansion + Route SEO

**Goal:** Increase indexable content surface and trust through evergreen pages.

### Scope

- Add and route:
  - `About`
  - `Collections`
  - `Insights`
- Add route-level SEO metadata hook.
- Add internal linking from nav and page CTAs.

### Acceptance criteria

- Users can navigate at least 3 evergreen pages beyond feed routes.
- Each page sets unique title/description/canonical.
- Navigation remains responsive and accessible.

### Commit / PR

- **Commit:** `feat(seo): add editorial content pages with route-level metadata`
- **PR title:** `feat(seo): add editorial content pages with route-level metadata`

---

## Achievement 6 - Conversion Copy Upgrade (High-End Content Creator Pass)

**Goal:** Improve perceived quality and action clarity by upgrading button and CTA language across the product.

### Scope

- Upgrade CTA text in:
  - Home hero
  - Content offer block
  - Post card read action
  - Category load-more action
  - Article detail outbound action
  - Navbar source action
- Keep tone consistent with premium editorial brand voice.

### Acceptance criteria

- No generic CTA copy remains in high-traffic surfaces.
- Copy conveys specific intent and user value.
- All updated CTAs remain concise and scannable.

### Commit / PR

- **Commit:** `refactor(content): upgrade CTA messaging for premium editorial tone`
- **PR title:** `refactor(content): upgrade CTA messaging for premium editorial tone`

---

## Achievement 7 - Build-Time Detail Cache Pipeline (CI + App Integration)

**Goal:** Pre-structure detail pages by fetching article payloads during CI/scheduled cache workflows.

### Scope

- Add `fetch-a-day-post-details.sh`.
- Add `post-details.json` cache artifact.
- Wire `cache:build` script in `package.json`.
- Execute cache generation in CI and deploy workflows.
- Extend scheduled cache update workflow to include post-details artifact.
- Update `fetchPostById` to read cache first, then network fallback.

### Acceptance criteria

- Detail cache generated successfully in automation environments.
- App can resolve detail content from prebuilt cache.
- Fallback to network remains functional.

### Commit / PR

- **Commit:** `feat(cache): prebuild structured article detail pages for runtime`
- **PR title:** `feat(cache): prebuild structured article detail pages for runtime`

---

## Achievement 8 - Structured Data and Crawlability Hardening

**Goal:** Improve discoverability quality and search representation.

### Scope

- Add `public/sitemap.xml`
- Add `public/robots.txt`
- Add optional JSON-LD blocks on evergreen pages (Organization, WebSite)

### Acceptance criteria

- Core routes are explicitly crawlable.
- Metadata and structured hints are consistent.

### Commit / PR

- **Commit:** `feat(seo): add sitemap robots and structured metadata hints`
- **PR title:** `feat(seo): add sitemap robots and structured metadata hints`

---

## Achievement 9 - Content Depth and Trust Signals

**Goal:** Make the site feel complete and credible with richer long-form sections and trust content.

### Scope

- Expand home and evergreen pages with:
  - Editorial standards section
  - Source transparency
  - Reading philosophy
  - FAQ / expectation-setting blocks

### Acceptance criteria

- Every top-level page has substantial informative content (not just navigational scaffolding).
- Tone remains cohesive and premium.

### Commit / PR

- **Commit:** `feat(content): expand editorial trust and long-form page depth`
- **PR title:** `feat(content): expand editorial trust and long-form page depth`

---

## QA and Release Checklist (Apply per PR)

- [ ] Lint passes (`pnpm lint`)
- [ ] Build passes (`pnpm build`)
- [ ] Mobile and desktop sanity pass complete
- [ ] CTA copy reviewed for consistency
- [ ] Route metadata updated and verified
- [ ] PR description includes:
  - Why
  - Scope
  - Risks
  - Test plan

## Execution Order (from now)

1. Achievement 5 (multi-page + route SEO)
2. Achievement 6 (CTA copy upgrade)
3. Achievement 7 (build-time detail cache)
4. Achievement 8 (crawlability hardening)
5. Achievement 9 (content depth and trust signals)
