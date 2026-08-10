import { initTheme } from './lib/theme.js';
import { mountApp } from './app.js';

initTheme();

const root = document.querySelector('#app');

if (root instanceof HTMLElement) {
  void mountApp(root);
}
