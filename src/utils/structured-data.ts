import { SITE_NAME, SITE_URL } from '@constants/site';
import type {
  JsonLdEvergreenWebPageDocument,
  JsonLdHomeDocument,
  JsonLdOrganization,
  JsonLdWebPage,
  JsonLdWebSite,
} from 'types/seo.types';

const organizationId = `${SITE_URL}/#organization` as const;
const websiteId = `${SITE_URL}/#website` as const;

function organizationNode(): JsonLdOrganization {
  return {
    '@type': 'Organization',
    '@id': organizationId,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };
}

function websiteNode(): JsonLdWebSite {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': organizationId },
  };
}

/** Organization + WebSite for the home surface. */
export function buildHomeStructuredData(): JsonLdHomeDocument {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode()],
  };
}

/** Organization, WebSite, and WebPage for evergreen editorial pages. */
export function buildEvergreenWebPageStructuredData(
  path: string,
  pageTitle: string,
): JsonLdEvergreenWebPageDocument {
  const pageUrl = `${SITE_URL}${path}`;
  const webPage: JsonLdWebPage = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${pageTitle} | ${SITE_NAME}`,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode(), webPage],
  };
}
