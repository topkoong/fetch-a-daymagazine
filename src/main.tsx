/**
 * Application entry: global styles, Preact mount, and React Router with a **fixed basename**
 * so the same build works on GitHub Pages (`/fetch-a-daymagazine/`) and locally when opened
 * under that path. Must stay aligned with `vite.config.ts` → `base` and `README.md` routes.
 */
import './index.css';

import { render } from 'preact';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

render(
  <BrowserRouter basename='/fetch-a-daymagazine'>
    <App />
  </BrowserRouter>,
  document.getElementById('app') as HTMLElement,
);
