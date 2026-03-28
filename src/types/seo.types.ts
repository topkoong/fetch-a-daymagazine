/** schema.org Organization node referenced by `@id` elsewhere in the graph. */
export interface JsonLdOrganization {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
}

/** schema.org WebSite; `publisher` points at the Organization `@id`. */
export interface JsonLdWebSite {
  '@type': 'WebSite';
  '@id': string;
  name: string;
  url: string;
  publisher: { '@id': string };
}

/** schema.org WebPage for evergreen routes (About, Insights, etc.). */
export interface JsonLdWebPage {
  '@type': 'WebPage';
  '@id': string;
  url: string;
  name: string;
  isPartOf: { '@id': string };
  about: { '@id': string };
}

/** Home: Organization + WebSite only (no per-page WebPage node). */
export interface JsonLdHomeDocument {
  '@context': 'https://schema.org';
  '@graph': [JsonLdOrganization, JsonLdWebSite];
}

/** Evergreen editorial page: Organization + WebSite + WebPage. */
export interface JsonLdEvergreenWebPageDocument {
  '@context': 'https://schema.org';
  '@graph': [JsonLdOrganization, JsonLdWebSite, JsonLdWebPage];
}

export type JsonLdDocument = JsonLdHomeDocument | JsonLdEvergreenWebPageDocument;
