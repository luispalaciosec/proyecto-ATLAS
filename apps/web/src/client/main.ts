import { mountApp } from './app.js';

const root = document.querySelector('#app');

if (root instanceof HTMLElement) {
  void mountApp(root);
}
