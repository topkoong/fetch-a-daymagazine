# Product Growth Plan — Toppy × a day magazine

## Vision

Evolve Toppy from a single-feed interface into a premium editorial web product:

- richer narrative content
- stronger conversion copy
- route-level SEO
- multiple evergreen pages for discoverability and trust
- resilient article rendering with build-time content preparation

This document is intentionally detailed so each achievement can ship as one focused PR.

---

## Product Principles

1. **Editorial clarity first** — every screen helps users decide what to read next.
2. **Premium feel, not decorative clutter** — restraint, spacing rhythm, hierarchy.
3. **SEO by structure** — meaningful pages, durable URLs, route-specific metadata.
4. **Performance confidence** — resilient data sourcing and graceful fallback states.
5. **Incremental shipping discipline** — one objective per PR, measurable outcome.
6. **Enterprise-grade code** — every variable typed, every interface named, every file placed deliberately.

---

## Engineering Standards (Non-Negotiable)

These rules apply to every file in every PR. Cursor must follow them without being reminded.

### TypeScript — strict mode always on

```jsonc
// tsconfig.json — must include all of these
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
  },
}
```

If any of these flags produce errors in existing code, fix the errors — do not relax the flags.

---

### File and Folder Naming Conventions

| What                   | Convention                  | Example                 |
| ---------------------- | --------------------------- | ----------------------- |
| React component file   | PascalCase                  | `PostCard.tsx`          |
| Component folder       | PascalCase                  | `components/PostCard/`  |
| Component style module | PascalCase + `.module.css`  | `PostCard.module.css`   |
| Hook file              | camelCase with `use` prefix | `usePostById.ts`        |
| Utility / helper file  | camelCase                   | `sanitizeHtml.ts`       |
| Type / interface file  | camelCase                   | `post.types.ts`         |
| Constant file          | camelCase                   | `routes.constants.ts`   |
| Asset / cached JSON    | kebab-case                  | `post-details.json`     |
| Page component file    | PascalCase                  | `PostReader.tsx`        |
| Page folder            | PascalCase                  | `pages/PostReader/`     |
| Test file              | same name + `.test.ts(x)`   | `PostCard.test.tsx`     |
| Shell script           | kebab-case                  | `fetch-post-details.sh` |

**One component = one folder.** Every component lives in its own folder:

```
components/PostCard/
  PostCard.tsx           ← component
  PostCard.module.css    ← styles
  PostCard.types.ts      ← local types
  index.ts               ← barrel export
```

The `index.ts` barrel file must always re-export:

```ts
export { PostCard } from './PostCard';
export type { PostCardProps } from './PostCard.types';
```

---

### Variable and Function Naming Conventions

| What                     | Convention                  | Example                                 |
| ------------------------ | --------------------------- | --------------------------------------- |
| Variables                | camelCase                   | `postDetails`, `isLoading`              |
| Constants (module-level) | SCREAMING_SNAKE_CASE        | `MAX_POSTS_PER_PAGE`                    |
| Boolean variables        | `is` / `has` / `can` prefix | `isLoading`, `hasError`, `canFetchMore` |
| Event handlers           | `handle` prefix             | `handleCardClick`, `handleLoadMore`     |
| Async functions          | verb phrase                 | `fetchPostById`, `buildPostIndex`       |
| React components         | PascalCase                  | `PostCard`, `PostReader`                |
| Custom hooks             | `use` prefix + noun         | `usePostById`, `useCategoryFeed`        |
| Enum keys                | SCREAMING_SNAKE_CASE        | `LoadState.IDLE`                        |
| Type names               | PascalCase                  | `Post`, `PostDetail`, `Category`        |
| Interface names          | PascalCase, no `I` prefix   | `PostCardProps`, `SeoMeta`              |

**Never use:**

- Single-letter variables outside short `.map((p) =>` callbacks
- `any` — use `unknown` and narrow with type guards
- Non-null assertion `!` — use optional chaining and explicit guards
- `var` — always `const`, then `let` only when mutation is needed
- Vague names: `data`, `item`, `obj`, `temp`, `stuff`, `info`, `res`, `result`

---

### Core TypeScript Interfaces

Cursor must create `src/types/` and define all interfaces below before touching any component.
All data flowing through the app must conform to one of these shapes.

```ts
// src/types/post.types.ts

export interface RenderedField {
  rendered: string;
}

export interface YoastMeta {
  title?: string;
  description?: string;
  og_image?: Array<{ url: string }>;
  og_title?: string;
  og_description?: string;
}

export interface Post {
  id: number;
  slug: string;
  date: string;
  title: RenderedField;
  excerpt: RenderedField;
  content: RenderedField;
  link: string;
  featured_media: number;
  categories: number[];
}

export interface PostDetail extends Post {
  yoast_head_json?: YoastMeta;
}

export interface PostCardViewModel {
  id: number;
  slug: string;
  title: string; // stripped of HTML tags
  excerpt: string; // stripped of HTML tags
  date: string;
  imageUrl: string | null;
  categoryIds: number[];
  sourceUrl: string;
  internalUrl: string; // /posts/:id
}
```

```ts
// src/types/category.types.ts

export interface Category {
  id: number;
  slug: string;
  name: string;
  count: number;
  link: string;
}

export interface CategoryViewModel {
  id: number;
  slug: string;
  label: string;
  postCount: number;
  internalUrl: string; // /topics/:slug
}
```

```ts
// src/types/media.types.ts

export interface MediaSize {
  source_url: string;
  width: number;
  height: number;
}

export interface MediaItem {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, MediaSize>;
  };
}
```

```ts
// src/types/seo.types.ts

export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  twitterCard: 'summary' | 'summary_large_image';
}

export interface JsonLdOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
}
```

```ts
// src/types/api.types.ts

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loadState: LoadState;
  error: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}
```

```ts
// src/types/index.ts — barrel export for all types
export type {
  Post,
  PostDetail,
  PostCardViewModel,
  RenderedField,
  YoastMeta,
} from './post.types';

export type { Category, CategoryViewModel } from './category.types';

export type { MediaItem, MediaSize } from './media.types';

export type { SeoMeta, JsonLdOrganization } from './seo.types';

export type { LoadState, AsyncState, PaginatedResponse } from './api.types';
```

---

### Constants File Structure

```ts
// src/constants/routes.constants.ts
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  COLLECTIONS: '/collections',
  INSIGHTS: '/insights',
  POST_DETAIL: '/posts/:id',
  TOPIC: '/topics/:slug',
  postDetail: (id: number): string => `/posts/${id}`,
  topic: (slug: string): string => `/topics/${slug}`,
} as const;

// src/constants/api.constants.ts
const API_BASE_URL = 'https://adaymagazine.com/wp-json/wp/v2';

export const MAX_POSTS_PER_PAGE = 100;
export const MAX_DETAIL_CACHE_ENTRIES = 50;
export const CACHE_STALE_THRESHOLD_MS = 1000 * 60 * 60 * 24;

export const API_ENDPOINTS = {
  POSTS: `${API_BASE_URL}/posts`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  MEDIA: `${API_BASE_URL}/media`,
  postById: (id: number): string => `${API_BASE_URL}/posts/${id}`,
  mediaById: (id: number): string => `${API_BASE_URL}/media/${id}`,
} as const;

// src/constants/copy.constants.ts
export const COPY = {
  HERO_HEADLINE: 'อ่านทุกเรื่องที่อยากรู้\nจาก a day — เร็วกว่าที่เคย',
  HERO_SUBHEADLINE:
    'รวมบทความเด่นจาก People, Art & Design และ Life & Culture ไว้ในที่เดียว',
  HERO_CTA_PRIMARY: "Explore today's stories",
  HERO_CTA_SECONDARY: 'Browse by category',
  CARD_CTA: 'Read the full story',
  READER_CTA_EXTERNAL: 'Open original on a day',
  READER_CTA_BACK: 'Back to feed',
  BOTTOM_CTA_PRIMARY: 'Open the full magazine',
  BOTTOM_CTA_SECONDARY: 'Explore collections',
} as const;

// src/constants/external-links.constants.ts
export const EXTERNAL_LINKS = {
  ADAY_HOME: 'https://adaymagazine.com/',
  ADAY_PEOPLE:
    'https://adaymagazine.com/category/experiences/life/q-and-a-day-interview/',
  ADAY_ART: 'https://adaymagazine.com/category/experiences/creative/artist-talk/',
  ADAY_CULTURE: 'https://adaymagazine.com/category/experiences/life/a-better-day/',
  ADAY_VIDEO: 'https://adaymagazine.com/video/',
  ADAY_PODCAST: 'https://adaymagazine.com/podcast/',
  ADAY_SERIES: 'https://adaymagazine.com/series/',
  ADAY_MAGAZINE: 'https://adaymagazine.com/category/a-day-magazine',
} as const;
```

---

### Hook Signature Standard

Every custom hook must follow this exact pattern:

```ts
// src/hooks/usePostById.ts
import type { AsyncState, PostDetail } from '../types';

export function usePostById(id: number): AsyncState<PostDetail> {
  // 1. try cache (build-time JSON import)
  // 2. fallback to network fetch
  // 3. return { data, loadState, error }
}
```

No hook may return raw `undefined`.
Always return `AsyncState<T>` so every consumer handles loading and error states explicitly.

---

### Component Prop Standard

Every component must export its props interface from its own `.types.ts` file:

```ts
// src/components/PostCard/PostCard.types.ts
import type { PostCardViewModel } from '../../types';

export interface PostCardProps {
  post: PostCardViewModel;
  onCardClick?: (id: number) => void;
  isCompact?: boolean;
}
```

No component may accept `any` as a prop type.
No inline prop type definitions: `({ title }: { title: string }) =>` is banned.
All prop interfaces must be explicitly named and exported.

---

### Utility Mapper Standard

Raw API responses must be mapped to ViewModels before reaching any component.
Mappers live in `src/utils/` and are pure functions with explicit types:

```ts
// src/utils/post.utils.ts
import type { Post, PostCardViewModel } from '../types';
import { ROUTES } from '../constants/routes.constants';
import { stripHtml } from './sanitize.utils';

export function toPostCardViewModel(
  post: Post,
  imageUrl: string | null,
): PostCardViewModel {
  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    imageUrl,
    categoryIds: post.categories,
    sourceUrl: post.link,
    internalUrl: ROUTES.postDetail(post.id),
  };
}
```

---

## Content and Brand Voice Guide

### Voice

- Confident, calm, expert.
- Precise verbs over generic marketing filler.
- Fewer words, stronger intention.

### CTA rules

- Primary CTA: action + value outcome.
- Secondary CTA: low-friction exploration.
- All CTA strings imported from `src/constants/copy.constants.ts` — no hardcoded strings in components.
- Banned: "click here", "read more", "learn more", "find out", "check this out"

---

## Design Token File

Cursor must create this before any visual changes.
All style values reference tokens — no hardcoded hex or pixel values in component CSS.

```css
/* src/styles/tokens.css */
:root {
  --brand-red: #e8002d;
  --brand-black: #111111;
  --brand-white: #fafaf7;
  --brand-cream: #f5f0e8;
  --brand-ink-shadow: 3px 3px 0 #111111;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-2xl: 40px;
  --text-3xl: 56px;

  --btn-padding: 12px 24px;
  --btn-radius: 4px;
  --btn-weight: 700;
  --card-radius: 4px;
  --section-border: 3px solid var(--brand-black);
}
```

---

## Build-Time Content Fetching

### Why

Runtime fetching means every user waits for the WordPress API on every load.
Build-time fetching means content is pre-bundled — instant render, no spinner, no dependency on the source API at runtime.

### Fetch scripts (`cachescripts/`)

```bash
# cachescripts/fetch-posts.sh
#!/bin/bash
set -euo pipefail
curl --connect-timeout 10 --max-time 30 --retry 3 \
  "https://adaymagazine.com/wp-json/wp/v2/posts?per_page=100&_fields=id,title,excerpt,date,categories,featured_media,link,slug" \
  -o src/assets/cached/posts.json

# cachescripts/fetch-categories.sh
#!/bin/bash
set -euo pipefail
curl --connect-timeout 10 --max-time 30 --retry 3 \
  "https://adaymagazine.com/wp-json/wp/v2/categories?per_page=50" \
  -o src/assets/cached/categories.json
```

### package.json scripts

```json
{
  "scripts": {
    "cache:posts": "bash cachescripts/fetch-posts.sh",
    "cache:categories": "bash cachescripts/fetch-categories.sh",
    "cache:details": "bash cachescripts/fetch-post-details.sh",
    "cache:all": "pnpm cache:posts && pnpm cache:categories && pnpm cache:details",
    "prebuild": "pnpm cache:all"
  }
}
```

### App fetch order (enforced in every hook)

```ts
async function fetchPosts(): Promise<Post[]> {
  try {
    const cached = await import('../assets/cached/posts.json');
    if (Array.isArray(cached.default) && cached.default.length > 0) {
      return cached.default as Post[];
    }
  } catch (_: unknown) {
    // cache miss — fall through to network
  }
  const response = await fetch(API_ENDPOINTS.POSTS);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }
  return response.json() as Promise<Post[]>;
}
```

---

## Internal Article Reader Page

Every article card CTA must route to `/posts/:id` — an internal reader page.
The external adaymagazine.com link is a secondary action on the reader page only.

### Card CTA (the fix)

```tsx
// BEFORE — sends user away immediately
<a href={post.link} target="_blank">Read more</a>

// AFTER — stays in app, typed with PostCardViewModel
<Link to={ROUTES.postDetail(post.id)} className={styles.cardCta}>
  {COPY.CARD_CTA}
</Link>
```

### Reader page layout

```
┌───────────────────────────────────────┐
│  ← Back to feed      [Open original]  │  top bar
├───────────────────────────────────────┤
│  CATEGORY LABEL                       │
│  Article Title                        │
│  Date · Read time                     │
├───────────────────────────────────────┤
│  ██████████████████████████████████  │  hero image full width
├───────────────────────────────────────┤
│  Body text (content.rendered)         │
├───────────────────────────────────────┤
│  [Read the full story on a day →]     │  external CTA (secondary)
│  [← Back to feed]                     │
└───────────────────────────────────────┘
```

---

## GitHub Pages SPA Routing Fix (BLOCKER)

Every route beyond `/` will hard-404 on GitHub Pages without this.

```json
// package.json
"postbuild": "cp dist/index.html dist/404.html"
```

Also confirm `vite.config.ts`:

```ts
export default defineConfig({
  base: '/fetch-a-daymagazine/',
});
```

---

## PR Description Standard

Cursor must write every PR description by answering concrete questions about the actual work done.
It must NOT submit the template with placeholders left unfilled.

### PR title format

```
<type>(<scope>): <plain English summary — max 72 chars>
```

### How Cursor writes the PR description

After the work is done and lint + build pass, Cursor answers each question
in full sentences — no placeholders, no italic instructions remaining:

```
1. One paragraph: what did you actually change and why?
2. Which achievement in plan.md does this correspond to exactly?
3. Every file you touched — one sentence per file explaining why.
4. Paste the exact terminal output of pnpm lint verbatim.
5. Paste the exact terminal output of pnpm build verbatim.
6. Numbered steps a reviewer can follow to verify this works.
7. For each checkbox: YES or NO based on what was actually verified.
8. What could break or regress because of this PR?
```

### Filled example (this is the standard — not the template)

```markdown
## What this PR does

Adds `public/sitemap.xml` and `public/robots.txt` so search engines can
discover all route paths. Also adds a typed JSON-LD Organization schema block
to the home page via `buildOrganizationSchema()`. Without this, Google cannot
index any page beyond `/`.

## Achievement

Achievement 8 — Structured Data and Crawlability Hardening

## Files changed

| File                        | Why it was touched                                       |
| --------------------------- | -------------------------------------------------------- |
| `public/sitemap.xml`        | Lists all crawlable routes with lastmod dates            |
| `public/robots.txt`         | Allows all crawlers, points to sitemap                   |
| `src/pages/Home/Home.tsx`   | Added JSON-LD script block using buildOrganizationSchema |
| `src/types/seo.types.ts`    | Added JsonLdOrganization interface                       |
| `src/utils/jsonLd.utils.ts` | Created buildOrganizationSchema(): JsonLdOrganization    |

## pnpm lint output
```

$ pnpm lint

> eslint . --ext .ts,.tsx

0 problems (0 errors, 0 warnings)

```

## pnpm build output
```

$ pnpm build
vite v5.x.x building for production...
✓ 142 modules transformed.
dist/index.html 1.23 kB
dist/assets/index.js 284.5 kB
✓ built in 4.21s

```

## How to test
1. Run `pnpm build` — confirm `dist/404.html` exists
2. Run `pnpm preview`
3. Open `http://localhost:4173/sitemap.xml` — confirm XML renders with all routes listed
4. Open `http://localhost:4173/robots.txt` — confirm sitemap URL is referenced
5. Open `http://localhost:4173/` — DevTools → Elements → search `application/ld+json` — confirm schema block

## Checkboxes
- [x] `pnpm lint` — 0 errors (output pasted above)
- [x] `pnpm build` — 0 TypeScript errors (output pasted above)
- [x] grep -rn ": any" src/ — 0 matches
- [x] grep -rn "as any" src/ — 0 matches
- [ ] No CTA contains banned copy — N/A (no CTA changes in this PR)
- [x] Every new route loads without 404 on direct URL and refresh
- [x] Tested on desktop Chrome
- [x] Tested on mobile 375px — no horizontal scroll, no clipped text

## Risks and follow-ups
- Sitemap is static and must be updated when new routes are added.
- `buildOrganizationSchema` has hardcoded org data — should move to constants in a follow-up.
```

---

## Delivery Constraints

- One achievement = one branch = one PR.
- Conventional commit format only.
- No mixed-scope PRs.
- Every PR must pass before merge:
  - `pnpm lint` — 0 errors, full output pasted in PR
  - `pnpm build` — 0 errors, full output pasted in PR
  - `grep -rn ": any" src/` — 0 matches
  - `grep -rn "as any" src/` — 0 matches
- No new file created without a corresponding type or interface.
- No component rendered without explicitly typed and named props.
- No CTA string hardcoded in a component — all from `copy.constants.ts`.

---

## Progress Tracking

Cursor must update this section as the final step of every PR — before pushing.
No PR is complete until the status below reflects the new state.

### How to update

At the end of every achievement, Cursor must:

1. Change the achievement status from `Not started` or `In progress` to `Completed`
2. Fill in the completed date
3. Update the summary line with what actually shipped
4. Commit the updated plan.md as part of the same PR — not a separate commit

Commit format for the plan update (append to the existing commit, do not make a new one):
The plan.md change is included in the achievement commit automatically —
stage it alongside the feature files before committing.

---

### Current Progress

| #   | Achievement                                   | Status       | Completed  |
| --- | --------------------------------------------- | ------------ | ---------- |
| 1   | Navigation stability and responsiveness       | ✅ Completed | —          |
| 2   | Internal detail flow + image fallback         | ✅ Completed | —          |
| 3   | Typography rhythm + first render stability    | ✅ Completed | —          |
| 3.5 | GitHub Pages SPA routing fix                  | ✅ Completed | 2026-03-28 |
| 4   | Type system, tokens, hero redesign            | ✅ Completed | 2026-03-28 |
| 5   | Internal /posts/:id reader page               | ✅ Completed | 2026-03-28 |
| 5.1 | Topic landing pages + share metadata          | ✅ Completed | 2026-03-28 |
| 6   | Conversion copy upgrade                       | ✅ Completed | —          |
| 7   | Build-time cache pipeline                     | ✅ Completed | 2026-03-28 |
| 8   | Sitemap, robots.txt, JSON-LD                  | ✅ Completed | 2026-03-28 |
| 9   | Content depth and trust signals               | ✅ Completed | 2026-03-28 |
| HF3 | Post card: single CTA, HTML entities, excerpt | ✅ Completed | 2026-03-28 |

**Legend:** ✅ Completed · 🔄 In progress · 🔲 Not started · 🚧 Blocked

---

### Blocked items

| Achievement | Blocked by | Notes                                                                         |
| ----------- | ---------- | ----------------------------------------------------------------------------- |
| —           | —          | None — Achievement 3.5 ships `dist/404.html` for GitHub Pages SPA deep links. |

---

### What shipped in each PR

| PR  | Branch                                     | Achievement | What actually changed                                                                                                                                                          |
| --- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| —   | —                                          | 1           | Navbar sticky, z-index fixed, mobile breakpoints stable                                                                                                                        |
| —   | —                                          | 2           | Card CTA routes internally, image fallback message added                                                                                                                       |
| —   | —                                          | 3           | Type scale tightened, first-paint pop-in reduced                                                                                                                               |
| —   | —                                          | 6           | All CTA copy upgraded, banned phrases removed                                                                                                                                  |
| —   | fix/routing-gh-pages-404-html              | 3.5         | `postbuild` copies `dist/index.html` to `dist/404.html` for GitHub Pages deep links                                                                                            |
| —   | hotfix/homepage-redesign-and-reader-polish | — (hotfix)  | Editorial featured hero, category chips, feed-only home; navbar category row owned by Navbar; cream page background; related stories on reader                                 |
| —   | fix/post-card-cta-entities-excerpt         | HF3         | Single `Post` card CTA; `stripHtmlTags` decodes HTML entities; excerpt paragraph omitted when empty (no hardcoded fallback)                                                    |
| —   | fix/related-posts-app-shell                | —           | Related stories ordered by newest date; `#app` uses brand-white like `body`; plan documents A4/A5 overlap with merged homepage/reader work                                     |
| #32 | chore/docs-developer-comments              | —           | JSDoc/comments for related posts, magazine feed fallback, PostDetails queries + related strip, RelatedArticles data contract, `stripHtmlTags`, post-card VM, `index.css` shell |
| #33 | chore/plan-closeout-seo-types              | —           | `plan.md` achievements marked complete vs shipped tree; `src/types/seo.types.ts` + typed JSON-LD graph in `structured-data.ts` / `JsonLd`                                      |
| #34 | fix/category-feed-bundled-fallback         | —           | Navbar category `/posts/categories/:id` uses bundled `posts.json` when live WP request fails or returns non-JSON; `posts/categories` route ordered before `posts/:id`          |
| —   | chore/docs-app-jsdoc-readme                | —           | File-level JSDoc on `main`/`app`, pages, navbar, feeds, cards, `useSeo`/`JsonLd`, categories API; README documentation map updated for inline docs scope                       |

---

**Then add this line to your Cursor prompt, right before step 7:**

6b. Update plan.md: - Change this achievement's status to ✅ Completed - Fill in today's date in the Completed column - Add one sentence to the "What shipped" table describing what actually changed - Stage plan.md alongside the feature files in the same commit
Do not create a separate commit for the plan update.

---

## Achievement Tracker

### Achievement 1 — Navigation Stability and Responsiveness

**Status:** Completed and merged

### Achievement 2 — Internal Detail Flow + Image Fallback Messaging

**Status:** Completed and merged

### Achievement 3 — Typography Rhythm + First Render Stability

**Status:** Completed and merged

---

### Achievement 3.5 — GitHub Pages SPA Routing Fix

**Status:** Completed and merged

**Files to touch:**

- `package.json` — add `"postbuild": "cp dist/index.html dist/404.html"`
- `vite.config.ts` — confirm `base: '/fetch-a-daymagazine/'`

**Automated checks:**

- `pnpm build` exits 0
- `dist/404.html` exists after build and is identical to `dist/index.html`
- Navigating to `/posts/1` in `pnpm preview` loads the app, not a browser 404

**Commit:** `fix(routing): add 404.html fallback for GitHub Pages SPA deep links`
**PR title:** `fix(routing): resolve deep-link 404s on GitHub Pages`

---

### HF3 — Post card: single CTA, HTML entities, excerpt fallback

**Status:** ✅ Completed (2026-03-28)

Shipped: one primary link per `Post` card (`COPY.CARD_CTA` as direct text), `stripHtmlTags` decodes entities (textarea in browser, manual replacements for SSR), empty excerpts hide the excerpt line with no generic filler string.

---

### Achievement 4 — Landing Hierarchy, Type System Foundation, and CTA Redesign

**Status:** ✅ Completed (2026-03-28)

**Shipped:** `FeaturedArticle/*`, `CategoryChips/*`, `ArticleFeed/*`, `Home.tsx`, `PostCardViewModel` + `toPostCardViewModel`, design tokens, and `ROUTES` — equivalent intent to the original Hero/`PostCard` folder sketch; names differ for the merged homepage architecture.

**Files to touch:**

```

src/styles/tokens.css ← CREATE: design tokens
src/types/post.types.ts ← CREATE: Post, PostDetail, PostCardViewModel
src/types/category.types.ts ← CREATE: Category, CategoryViewModel
src/types/api.types.ts ← CREATE: LoadState, AsyncState
src/types/seo.types.ts ← CREATE: SeoMeta, JsonLdOrganization
src/types/index.ts ← CREATE: barrel export
src/constants/routes.constants.ts ← CREATE: ROUTES
src/constants/api.constants.ts ← CREATE: API_ENDPOINTS, MAX_POSTS_PER_PAGE
src/constants/copy.constants.ts ← CREATE: COPY
src/constants/external-links.constants.ts ← CREATE: EXTERNAL_LINKS
src/utils/sanitize.utils.ts ← CREATE: stripHtml, sanitizeHtml
src/utils/post.utils.ts ← CREATE: toPostCardViewModel
src/components/Hero/Hero.tsx ← REWRITE: headline + CTA using COPY constants
src/components/Hero/Hero.module.css ← REWRITE: retro styles via tokens
src/components/Hero/Hero.types.ts ← CREATE: HeroProps
src/components/Hero/index.ts ← CREATE: barrel export
src/components/PostCard/PostCard.tsx ← UPDATE: use PostCardViewModel, COPY.CARD_CTA
src/components/PostCard/PostCard.types.ts ← CREATE: PostCardProps typed with PostCardViewModel
src/components/PostCard/PostCard.module.css ← UPDATE: retro ink-shadow button styles
src/components/PostCard/index.ts ← CREATE: barrel export

```

**TypeScript requirements:**

- All interfaces defined before any component is touched
- `toPostCardViewModel(post: Post, imageUrl: string | null): PostCardViewModel` must exist
- `Hero` must accept typed `HeroProps` — no inline type definitions
- `PostCard` must accept `PostCardViewModel` — not raw `Post`
- Zero `any`, zero non-null assertions

**Automated checks:**

- `pnpm lint` — 0 errors
- `pnpm build` — 0 TypeScript errors, strict mode on
- `grep -rn ": any" src/` — 0 matches
- `grep -rn "as any" src/` — 0 matches
- `grep -r "read more\|click here\|learn more" src/` — 0 matches
- `grep -r "COPY\." src/components/Hero/Hero.tsx` — at least 2 matches (CTA strings from constants)

**Commit:** `feat(hero): typed hero redesign with design tokens, PostCardViewModel, and copy constants`
**PR title:** `feat(hero): type system foundation, design tokens, and retro CTA redesign`

---

### Achievement 5 — Internal Article Reader Page

**Status:** ✅ Completed (2026-03-28)

**Shipped:** `src/pages/PostDetails.tsx` at `posts/:id` — sanitized article HTML, hero image, source + topic hub links, **`RelatedArticles`** (category overlap, date-sorted). Optional refactor: extract `ReaderBody` / `ReaderHero` / `usePostById` as in the original file list.

**Files to touch:**

```

src/pages/PostReader/PostReader.tsx ← CREATE: reader page component
src/pages/PostReader/PostReader.module.css ← CREATE: retro reader layout styles
src/pages/PostReader/PostReader.types.ts ← CREATE: PostReaderProps
src/pages/PostReader/index.ts ← CREATE: barrel export
src/components/ReaderTopBar/ReaderTopBar.tsx ← CREATE: back + external link bar
src/components/ReaderTopBar/ReaderTopBar.types.ts
src/components/ReaderTopBar/index.ts
src/components/ReaderHero/ReaderHero.tsx ← CREATE: full-width hero image
src/components/ReaderHero/ReaderHero.types.ts
src/components/ReaderHero/index.ts
src/components/ReaderBody/ReaderBody.tsx ← CREATE: sanitized HTML renderer
src/components/ReaderBody/ReaderBody.types.ts ← ReaderBodyProps { contentHtml: string }
src/components/ReaderBody/index.ts
src/components/ReaderFooterCTA/ ← CREATE: next article + external CTA
src/hooks/usePostById.ts ← CREATE: AsyncState<PostDetail>, cache-first
src/router.tsx ← ADD: /posts/:id route
src/assets/cached/post-details.json ← must exist (from cache:details script)

```

**TypeScript requirements:**

- `usePostById(id: number): AsyncState<PostDetail>` — exact signature, no deviation
- `ReaderBodyProps` must not accept raw `Post` — only `{ contentHtml: string }`
- All sub-components must have their own `.types.ts` and `index.ts`
- `sanitizeHtml(raw: string): string` must be typed with no `any`

**Automated checks:**

- `pnpm lint` — 0 errors
- `pnpm build` — 0 TypeScript errors
- `grep -r "target=\"_blank\"" src/components/PostCard` — 0 matches
- `/posts/1` in `pnpm preview` loads reader page, not 404

**Commit:** `feat(reader): add typed internal article reader with cache-first AsyncState hook`
**PR title:** `feat(reader): /posts/:id internal reader — typed components, cache-first, retro layout`

---

### Achievement 5.1 — Topic Landing Depth + Per-Story Share Metadata

**Status:** ✅ Completed (2026-03-28)

**Shipped:** `src/pages/TopicLanding.tsx`, `src/constants/topic-landings.ts` (`TOPIC_LANDINGS`, `getTopicBySlug`), route `topics/:slug`, and topic-level SEO via `useSeo`. Per-story share metadata is handled in `PostDetails` + `useSeo`.

**Shipped type shape:** `TopicLandingDefinition` in `topic-landings.ts` (slug, title, subtitle, description, keywords, categoryIds) — equivalent role to the earlier `TopicConfig` sketch below.

<details>
<summary>Original plan sketch (TopicPage / TopicConfig — not used verbatim)</summary>

```ts
// Earlier sketch — see TopicLandingDefinition in repo
export interface TopicConfig {
  slug: string;
  label: string;
  headline: string;
  subheadline: string;
  categoryIds: number[];
  externalUrl: string;
}
```

</details>

**Commit:** `feat(seo): typed topic landing pages with TopicConfig and enriched OG metadata`
**PR title:** `feat(seo): TopicConfig-typed topic pages and per-story social share metadata`

---

### Achievement 6 — Conversion Copy Upgrade

**Status:** Completed and merged

---

### Achievement 7 — Build-Time Detail Cache Pipeline

**Status:** ✅ Completed (2026-03-28)

**Shipped:** `.github/workflows/deployment.yml` runs `pnpm cache:build` before `pnpm build`; `cachescripts/cache-build.sh`, `fetch-a-day-posts.sh`, `fetch-a-day-post-details.sh`, validated JSON under `src/assets/cached/`. **PR #34:** `fetchCategoryPostsPage` uses that bundled list when the live category API fails or returns non-JSON (navbar `/posts/categories/:id` on GitHub Pages). Further curl timeouts / `MAX_DETAILS` caps remain optional hardening.

**TypeScript requirements:**

- `fetchPostById` returns `Promise<PostDetail>` — not `Promise<unknown>`
- Cache JSON imported with explicit type assertion: `as PostDetail[]`
- No `any` introduced in cache validation logic

**Commit:** `feat(cache): harden post-details pipeline with typed validation and CI bounds`
**PR title:** `feat(cache): typed cache-first pipeline with curl retries and MAX_DETAILS cap`

---

### Achievement 8 — Structured Data and Crawlability Hardening

**Status:** ✅ Completed (2026-03-28)

**Shipped:** `public/sitemap.xml`, `public/robots.txt`, `src/components/JsonLd.tsx`, `src/utils/structured-data.ts` (`buildHomeStructuredData`, `buildEvergreenWebPageStructuredData`), and **`src/types/seo.types.ts`** (`JsonLdOrganization`, `JsonLdWebSite`, `JsonLdWebPage`, document unions). Home uses `pages/Home.tsx` (not `Home/Home.tsx`).

**Commit:** `feat(seo): sitemap, robots.txt, and typed JSON-LD organization schema`
**PR title:** `feat(seo): sitemap, robots.txt, and buildOrganizationSchema for crawlability`

---

### Achievement 9 — Content Depth and Trust Signals

**Status:** ✅ Completed (2026-03-28)

**Shipped:** Long-form **About**, **Insights**, and **Collections** pages (`src/pages/*.tsx`) with editorial standards, source transparency, reading philosophy, and FAQ blocks. No standalone **`SocialProof`** component or `SOCIAL_SIGNALS` constant yet — optional follow-up if a reusable social strip is needed.

---

## QA Checklist (every PR — paste into PR description)

```
Automated — Cursor runs and pastes output into PR description:
- [ ] pnpm lint — 0 errors (full terminal output pasted)
- [ ] pnpm build — 0 errors (full terminal output pasted)
- [ ] grep -rn ": any" src/ — 0 matches
- [ ] grep -rn "as any" src/ — 0 matches
- [ ] grep -r "click here\|read more\|learn more" src/ — 0 matches

Human — 30-second spot check:
- [ ] Desktop Chrome — primary CTA visible without scrolling
- [ ] Mobile 375px — no horizontal scroll, no clipped text
- [ ] Click every CTA — correct destination, no dead ends
- [ ] Refresh any deep route — loads correctly, not 404
- [ ] PR description fully filled — zero placeholder text remaining
```

---

## Execution Order (historical — core track complete)

The ordered milestones below shipped under different **file names** than some early plan sketches (for example `FeaturedArticle` instead of `Hero/`, `PostDetails.tsx` instead of `PostReader/`, `topic-landings.ts` + `TopicLanding.tsx` instead of `topics.constants.ts` + `TopicPage/`). The **Current Progress** table is authoritative.

```
1. Achievement 3.5  ✅ GitHub Pages routing fix (`dist/404.html`, `base` in Vite)
2. Achievement 4    ✅ Tokens, `PostCardViewModel`, `FeaturedArticle`, `ArticleFeed`, `CategoryChips`, `Home`
3. Achievement 5    ✅ Internal reader at `posts/:id` — `PostDetails.tsx`, sanitized body, related strip
4. Achievement 5.1  ✅ `TopicLanding` + `TOPIC_LANDINGS`, per-topic SEO via `useSeo`
5. Achievement 7    ✅ `pnpm cache:build` before deploy; `cachescripts/*`, committed JSON under `src/assets/cached`
6. Achievement 8    ✅ `public/sitemap.xml`, `public/robots.txt`, `JsonLd` + `structured-data.ts` (+ typed `seo.types.ts`)
7. Achievement 9    ✅ Trust/editorial depth on `About`, `Insights`, `Collections` (no separate `SocialProof` component)
```

**Optional follow-ups (not blockers):** split `PostReader/*` for readability; add a reusable `SocialProof` strip; further curl hardening in cache scripts per Achievement 7 notes; optional `mobile-posts.json` slice for category fallback on small viewports (PR #34 uses full `posts.json`).

---

## The One-Line Rule

> Every instruction must be completable by someone who has never seen the codebase
> and is not allowed to ask a follow-up question.

If an instruction requires judgment, it is not an instruction — it is a wish.
Convert every wish into a file path, a type name, or a grep command.
