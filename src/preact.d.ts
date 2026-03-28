/**
 * Ensure intrinsic DOM tags in `.tsx` resolve to Preact's attribute maps.
 * Extending only `IntrinsicElements` avoids pulling in Preact's `JSX.Element`
 * (which is stricter than `react-router-dom` / `Fragment` typings in compat mode).
 */
import type { JSX as PreactJSX } from 'preact';

declare global {
  namespace JSX {
    interface IntrinsicElements extends PreactJSX.IntrinsicElements {}
  }
}

export {};
