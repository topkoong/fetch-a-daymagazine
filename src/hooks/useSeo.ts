import { SITE_NAME, SITE_URL } from '@constants/site';
import { useEffect } from 'preact/hooks';

interface UseSeoInput {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
  /** Plain-language label for og:image / Twitter previews. */
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  keywords?: readonly string[];
  type?: 'website' | 'article';
  /** ISO 8601 preferred; raw WordPress datetime strings are normalized in the hook. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Open Graph `article:section` (e.g. primary category or topic label). */
  articleSection?: string;
}

function upsertMeta(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  value: string,
) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function toIso8601(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined;
}

export default function useSeo({
  title,
  description,
  path = '/',
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  articleSection,
}: UseSeoInput) {
  useEffect(() => {
    const absoluteUrl = `${SITE_URL}${path}`;
    document.title = `${title} | ${SITE_NAME}`;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', absoluteUrl);

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta(
      'meta[property="og:title"]',
      'property',
      'og:title',
      `${title} | ${SITE_NAME}`,
    );
    upsertMeta(
      'meta[property="og:description"]',
      'property',
      'og:description',
      description,
    );
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', absoluteUrl);
    upsertMeta(
      'meta[name="twitter:title"]',
      'name',
      'twitter:title',
      `${title} | ${SITE_NAME}`,
    );
    upsertMeta(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      description,
    );

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
      upsertMeta(
        'meta[name="twitter:card"]',
        'name',
        'twitter:card',
        'summary_large_image',
      );
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
      if (imageAlt?.trim()) {
        upsertMeta(
          'meta[property="og:image:alt"]',
          'property',
          'og:image:alt',
          imageAlt.trim(),
        );
      }
      if (imageWidth && imageHeight) {
        upsertMeta(
          'meta[property="og:image:width"]',
          'property',
          'og:image:width',
          String(imageWidth),
        );
        upsertMeta(
          'meta[property="og:image:height"]',
          'property',
          'og:image:height',
          String(imageHeight),
        );
      }
    } else {
      upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    }

    const publishedIso = toIso8601(publishedTime);
    const modifiedIso = toIso8601(modifiedTime);
    if (type === 'article') {
      if (publishedIso) {
        upsertMeta(
          'meta[property="article:published_time"]',
          'property',
          'article:published_time',
          publishedIso,
        );
      }
      if (modifiedIso) {
        upsertMeta(
          'meta[property="article:modified_time"]',
          'property',
          'article:modified_time',
          modifiedIso,
        );
      }
      if (articleSection?.trim()) {
        upsertMeta(
          'meta[property="article:section"]',
          'property',
          'article:section',
          articleSection.trim(),
        );
      }
    }

    if (keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }
  }, [
    articleSection,
    description,
    imageAlt,
    imageHeight,
    imageUrl,
    imageWidth,
    keywords,
    modifiedTime,
    path,
    publishedTime,
    title,
    type,
  ]);
}
