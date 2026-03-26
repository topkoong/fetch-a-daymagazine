import type { WpPost } from 'types/wordpress';

function normalizeRenderedText(value: unknown): string {
  if (typeof value === 'string') return value;
  return '';
}

function normalizeCategoryIds(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

/**
 * Normalize uncertain WP API post payloads into strict app shape.
 */
export function normalizeWpPost(raw: unknown): WpPost | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;

  const id = Number(source.id);
  const link = typeof source.link === 'string' ? source.link : '';
  if (!Number.isFinite(id) || !link) return null;

  const titleRendered = normalizeRenderedText(
    (source.title as Record<string, unknown> | undefined)?.rendered,
  );
  const excerptRenderedRaw = (source.excerpt as Record<string, unknown> | undefined)
    ?.rendered;
  const excerptRendered =
    typeof excerptRenderedRaw === 'string' ? excerptRenderedRaw : null;

  const normalized: WpPost = {
    id,
    link,
    title: { rendered: titleRendered },
    excerpt: { rendered: excerptRendered },
    date: typeof source.date === 'string' ? source.date : undefined,
    categories: normalizeCategoryIds(source.categories),
    featured_image:
      typeof source.featured_image === 'object' && source.featured_image
        ? (source.featured_image as WpPost['featured_image'])
        : undefined,
  };

  return normalized;
}

export function normalizeWpPosts(rawList: unknown): WpPost[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((item) => normalizeWpPost(item))
    .filter((post): post is WpPost => Boolean(post));
}
