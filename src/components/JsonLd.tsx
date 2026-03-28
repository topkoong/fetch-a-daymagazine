/**
 * Injects a **schema.org JSON-LD** graph built by `structured-data.ts`. Typed as {@link JsonLdDocument}
 * so home vs evergreen shapes stay consistent with `seo.types.ts`.
 */
import type { FunctionComponent } from 'preact';
import type { JsonLdDocument } from 'types/seo.types';

interface JsonLdProps {
  data: JsonLdDocument;
}

const JsonLd: FunctionComponent<JsonLdProps> = ({ data }) => (
  <script
    type='application/ld+json'
    // JSON-LD must be embedded as raw JSON in the document.
    // eslint-disable-next-line react/no-danger -- schema.org payload only
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export default JsonLd;
