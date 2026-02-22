import type { Link } from './types';

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Extract all [[wikilinks]] from Markdown content.
 * Supports alias syntax: [[target|display text]]
 */
export function extractLinks(noteId: string, content: string): Link[] {
  const links: Link[] = [];
  const lines = content.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let match: RegExpExecArray | null;
    WIKILINK_REGEX.lastIndex = 0;

    while ((match = WIKILINK_REGEX.exec(line)) !== null) {
      const target = match[1].trim().toLowerCase().replace(/\s+/g, '-');
      const contextStart = Math.max(0, match.index - 40);
      const contextEnd = Math.min(line.length, match.index + match[0].length + 40);

      links.push({
        source: noteId,
        target,
        context: line.slice(contextStart, contextEnd),
        position: { line: lineIdx + 1, col: match.index + 1 },
      });
    }
  }

  return links;
}

/**
 * Normalize a note title to an id.
 * e.g. "My Note Title" -> "my-note-title"
 */
export function titleToId(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, '-');
}
