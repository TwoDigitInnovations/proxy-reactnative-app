export type RichBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string };

const HEADING_MARK = '\u0001';
const BULLET_MARK = '\u0002';

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&bull;': '•',
  '&middot;': '·',
  '&copy;': '©',
};

function decodeEntities(input: string): string {
  let out = input;
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char);
  }
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  return out.split('&amp;').join('&');
}

export function parseRichText(source: string): RichBlock[] {
  if (!source) return [];

  const marked = source
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, `\n${HEADING_MARK}`)
    .replace(/<li[^>]*>/gi, `\n${BULLET_MARK}`)
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(h[1-6]|p|div|li|ul|ol|tr|section)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return decodeEntities(marked)
    .split('\n')
    .map(line => line.replace(/[^\S\n]+/g, ' ').trim())
    .filter(Boolean)
    .map<RichBlock>(line => {
      if (line.startsWith(HEADING_MARK)) {
        return { type: 'heading', text: line.slice(HEADING_MARK.length).trim() };
      }
      if (line.startsWith(BULLET_MARK)) {
        return { type: 'bullet', text: line.slice(BULLET_MARK.length).trim() };
      }
      return { type: 'paragraph', text: line };
    })
    .filter(block => block.text.length > 0);
}
