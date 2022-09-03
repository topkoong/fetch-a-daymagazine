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
