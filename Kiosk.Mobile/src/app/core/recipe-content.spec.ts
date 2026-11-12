import { recipeHtml, recipeText } from './recipe-content';

describe('recipe content', () => {
  it('retains safe formatting and normalizes non-breaking spaces', () => {
    expect(recipeHtml('<p>Mix&nbsp;<strong>well</strong>.</p>')).toBe('<p>Mix <strong>well</strong>.</p>');
  });

  it('removes external resources, links, event handlers, and executable content', () => {
    const html = recipeHtml('<p style="background:url(https://example.com)">Read <a href="https://example.com">this</a><img src="https://example.com" onerror="alert(1)"></p><script>alert(1)</script><iframe src="https://example.com"></iframe>');
    expect(html).toBe('<p>Read this</p>');
  });

  it('renders descriptions as plain text rather than markup', () => {
    expect(recipeText('<p>Soup &amp; <strong>bread</strong></p>')).toBe('Soup & bread');
    expect(recipeHtml(null)).toBe('');
  });
});