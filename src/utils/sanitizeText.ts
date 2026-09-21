/**
 * Sanitizes AI response text into clean, human-readable plain text.
 * Strips raw Markdown, HTML tags, LaTeX expressions, code blocks, tables,
 * and normalizes lists and spacing for a polished SaaS presentation.
 */
export function sanitizePlainText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.replace(/\r\n/g, '\n');

  // 1. Remove code blocks and inline code backticks
  text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 2. Remove LaTeX expressions and convert math symbols to standard plain text
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2');
  text = text.replace(/\\times/g, ' * ');
  text = text.replace(/\\cdot/g, ' * ');
  text = text.replace(/\\pm/g, '+/-');
  text = text.replace(/\\approx/g, '~');
  text = text.replace(/\\text\{([^}]+)\}/g, '$1');
  text = text.replace(/\\textbf\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  text = text.replace(/\\left|\\right/g, '');
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  text = text.replace(/\$([^\$\n]+)\$/g, '$1');
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');

  // 3. Remove HTML tags, translating <br> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?[^>]+(>|$)/g, '');

  // 4. Remove Markdown table syntax
  // Remove separator rows like |---|---| or |:---|---:|
  text = text.replace(/^\s*\|?[\s\-:|]+\|?\s*$/gm, '');
  // Clean pipes from table rows: "| Header 1 | Header 2 |" -> "Header 1 - Header 2"
  text = text.replace(/^\s*\|\s*/gm, '');
  text = text.replace(/\s*\|\s*$/gm, '');
  text = text.replace(/\s*\|\s*/g, ' - ');

  // 5. Remove Markdown header syntax (e.g. "### Title" -> "Title")
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 6. Remove Markdown bold and italic markers (**bold** -> bold, *italic* -> italic)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');
  text = text.replace(/_([^_\n]+)_/g, '$1');

  // 7. Standardize list bullet points (* item or - item -> • item)
  text = text.replace(/^[\*\-\+]\s+/gm, '• ');

  // 8. Clean up extra bullet spaces or double bullets
  text = text.replace(/^[•\s]*•\s*/gm, '• ');

  // 9. Normalize excessive blank lines (more than 2 consecutive newlines -> 2)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
