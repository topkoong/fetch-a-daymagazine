import { useEffect } from 'preact/hooks';

const SITE_NAME = 'Toppy x a day magazine';
const SITE_URL = 'https://topkoong.github.io/fetch-a-daymagazine';

interface UseSeoInput {
  title: string;
  description: string;
  path?: string;
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

export default function useSeo({ title, description, path = '/' }: UseSeoInput) {
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
  }, [description, path, title]);
}
