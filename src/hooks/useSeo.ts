import { SITE_NAME, SITE_URL } from '@constants/site';
import { useEffect } from 'preact/hooks';

interface UseSeoInput {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
  keywords?: readonly string[];
  type?: 'website' | 'article';
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

export default function useSeo({
  title,
  description,
  path = '/',
  imageUrl,
  keywords = [],
  type = 'website',
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
    } else {
      upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    }

    if (keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }
  }, [description, imageUrl, keywords, path, title, type]);
}
