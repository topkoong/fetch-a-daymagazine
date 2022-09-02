import './index.css';

import App from './app';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'preact';

render(
  <BrowserRouter basename='/fetch-a-daymagazine'>
    <App />
  </BrowserRouter>,
  document.getElementById('app') as HTMLElement,
);
