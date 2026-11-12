import DOMPurify from 'dompurify';

export function recipeHtml(input: string | null): string {
  return DOMPurify.sanitize((input ?? '').replace(/&nbsp;|\u00a0/gi, ' '), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ol', 'ul', 'li', 'blockquote', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: [],
  });
}

export function recipeText(input: string | null): string {
  const document = new DOMParser().parseFromString(recipeHtml(input), 'text/html');
  return document.body.textContent?.replace(/\u00a0/g, ' ') ?? '';
}