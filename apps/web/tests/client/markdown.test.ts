/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '../../src/client/lib/markdown.js';

describe('renderMarkdown', () => {
  it('renders paragraphs and bold text', () => {
    const html = renderMarkdown('Hola **mundo**');

    expect(html).toContain('<strong>mundo</strong>');
    expect(html).not.toContain('**mundo**');
  });

  it('sanitizes script tags', () => {
    const html = renderMarkdown('<script>alert(1)</script>');

    expect(html.toLowerCase()).not.toContain('<script');
  });
});
