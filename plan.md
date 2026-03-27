# Incremental Delivery Plan (UI/UX + Performance + Stability)

## Objective

Ship the remaining product-quality improvements in small, meaningful pull requests.  
Each achievement below is intentionally scoped to one clear outcome, one conventional commit, and one PR.

## Delivery Rules

- One achievement = one branch = one PR.
- Use conventional commit format for every PR.
- Keep PRs focused and independently releasable.
- Every PR must pass `pnpm lint` and `pnpm build`.
- Prefer measurable impact (layout stability, reduced visual jank, clearer UX feedback).

## Achievement 1: Navigation Stability and Responsiveness

**Status:** Completed and merged  
**Goal:** Remove navbar overlap/flicker and make breakpoint behavior predictable.

### Scope

- Stabilize navbar layering and scroll behavior.
- Ensure mobile/desktop controls do not conflict.
- Keep navigation accessible and readable at all breakpoints.

### Done

- Sticky/layering fixes and breakpoint cleanup were delivered and merged.

### Validation

- Manual visual verification on mobile/tablet/desktop.
- `pnpm lint` and `pnpm build`.

---

## Achievement 2: Internal Content Flow + Media Fallback UX

**Status:** Completed and merged  
**Goal:** Keep users in-app when opening article content and provide graceful media fallback messaging.

### Scope

- Replace external CTA redirect with internal article detail route.
- Fetch and render source-backed article content in-app.
- Improve fallback UX when article image fails.

### Done

- Internal detail page and route added.
- Post card CTA now routes to in-app content page.
- Image fallback and message for unavailable source media delivered.

### Validation

- Route behavior test from Home/Category list to detail page.
- Fallback messaging verified with broken image cases.
- `pnpm lint` and `pnpm build`.

---

## Achievement 3: Typography Rhythm + First-Render Jank Reduction

**Status:** Completed and merged  
**Goal:** Improve visual hierarchy consistency and reduce perceived UI jumps during first paint.

### Scope

- Normalize typography rhythm and CTA sizing.
- Reduce layout shifts in loading and hero sections.
- Remove nested lazy imports in page trees to cut pop-in flicker.

### Done

- Shared typography/button scale updated.
- Loading and spacing rhythm tuned.
- Nested lazy imports removed in `Home` and `Posts`.

### Validation

- Visual comparison of first paint before/after.
- `pnpm lint` and `pnpm build`.

---

## Achievement 4: Hero and Landing Content Structure Refinement

**Status:** Planned  
**Goal:** Make the landing experience cleaner, more persuasive, and less visually noisy.

### Why this PR is next

- Current hero section has dense content blocks and mixed emphasis.
- A focused landing-content PR improves readability and conversion clarity.

### Scope

- Rebalance heading/subheading/section label hierarchy.
- Reduce repeated uppercase/text density in non-critical blocks.
- Improve CTA grouping and spacing for easier scanability.
- Tune card/background contrast for cleaner composition.

### Non-goals

- No API changes.
- No routing behavior changes.
- No shell script changes.

### Acceptance Criteria

- Hero reads clearly within 5 seconds on desktop and mobile.
- CTA priority is obvious (primary vs secondary).
- Content sections have consistent spacing rhythm.
- No overlap, clipping, or abrupt jumps at common breakpoints.

### Deliverables

- `src/pages/Home.tsx` UI structure refinements.
- `src/index.css` small style-token/util updates (if needed).

### Test Plan

- `pnpm lint`
- `pnpm build`
- Manual responsive pass: 360px, 768px, 1024px, 1440px.

### Commit/PR Plan

- **Commit:** `refactor(ui): refine landing hierarchy and CTA readability`
- **PR title:** `refactor(ui): refine landing hierarchy and CTA readability`

---

## Achievement 5: Category Grid Readability and Load-More UX Polish

**Status:** Planned  
**Goal:** Improve scanability in category pages and make progressive loading clearer.

### Scope

- Tighten post-card spacing/typography for denser but readable grids.
- Improve “Load more” affordance and loading feedback.
- Add clearer empty/end-of-feed states with consistent tone.

### Acceptance Criteria

- Cards remain readable at all breakpoints.
- Load-more action gives clear feedback and state transition.
- End states are informative and visually consistent.

### Deliverables

- `src/pages/Posts.tsx`
- `src/components/Post.tsx`
- `src/components/Spinner.tsx` (only if needed for consistency)

### Test Plan

- `pnpm lint`
- `pnpm build`
- Manual behavior pass for pagination and end-of-feed states.

### Commit/PR Plan

- **Commit:** `refactor(ux): polish category feed readability and load-more states`
- **PR title:** `refactor(ux): polish category feed readability and load-more states`

---

## Achievement 6: Performance-Oriented Asset Strategy (Large Cached JSON)

**Status:** Planned  
**Goal:** Reduce initial payload pressure caused by large cached data bundles.

### Scope

- Revisit cache import strategy for large JSON assets.
- Ensure data loading favors smaller initial JS payload on first view.
- Preserve fallback reliability when source API fails.

### Risks

- Behavior regressions in offline/fallback flows.
- Trade-offs between first paint speed and fallback immediacy.

### Acceptance Criteria

- No regression in fallback behavior.
- Reduced initial transferred JS on first route load.
- Stable rendering while data resolves.

### Deliverables

- `src/pages/Home.tsx` cache loading strategy refinement.
- Optional utility extraction for cache loaders.

### Test Plan

- `pnpm lint`
- `pnpm build`
- Network-throttled manual check (slow 3G equivalent).

### Commit/PR Plan

- **Commit:** `perf(data): reduce initial bundle pressure from cached feed assets`
- **PR title:** `perf(data): reduce initial bundle pressure from cached feed assets`

---

## Achievement 7: Final QA and Accessibility Hardening

**Status:** Planned  
**Goal:** Close the cycle with a focused quality PR for consistency and a11y.

### Scope

- Audit focus states, button semantics, aria labels, and status messaging.
- Align copy tone and messaging consistency across states.
- Fix minor regressions found during responsive QA.

### Acceptance Criteria

- No obvious keyboard-navigation blockers.
- Status/error/empty states are consistent and understandable.
- All pages maintain visual consistency under responsive checks.

### Deliverables

- Small targeted fixes across impacted UI files.

### Test Plan

- `pnpm lint`
- `pnpm build`
- Keyboard-only manual pass on Home, Category, Post detail routes.

### Commit/PR Plan

- **Commit:** `fix(a11y): harden focus states and status messaging consistency`
- **PR title:** `fix(a11y): harden focus states and status messaging consistency`

---

## Working Sequence (From This Point)

1. Achievement 4 (Landing hierarchy and CTA clarity)
2. Achievement 5 (Category feed UX polish)
3. Achievement 6 (Asset/perf improvements)
4. Achievement 7 (Final QA and accessibility hardening)

## Definition of Done for Each PR

- Single focused concern with clear user impact.
- Conventional commit message.
- PR description includes why, what, risks, and test plan.
- `pnpm lint` + `pnpm build` green.
