import type { Note } from './types';

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

/**
 * Parse a raw Markdown string into a Note object.
 */
export function parseNote(id: string, raw: string, stats?: { createdAt: Date; updatedAt: Date }): Note {
  const frontmatterMatch = raw.match(FRONTMATTER_REGEX);
  let frontmatter: Record<string, unknown> = {};
  let content = raw;

  if (frontmatterMatch) {
    frontmatter = parseFrontmatter(frontmatterMatch[1]);
    content = raw.slice(frontmatterMatch[0].length);
  }

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = (frontmatter['title'] as string) ?? titleMatch?.[1] ?? id;

  return {
    id,
    title,
    content: raw,
    frontmatter,
    createdAt: stats?.createdAt ?? new Date(),
    updatedAt: stats?.updatedAt ?? new Date(),
  };
}

/**
 * Serialize a Note back to Markdown with frontmatter.
 */
export function serializeNote(note: Note): string {
  const hasFrontmatter = Object.keys(note.frontmatter).length > 0;
  if (!hasFrontmatter) return note.content;

  const yaml = Object.entries(note.frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');

  return `---\n${yaml}\n---\n${note.content}`;
}

function parseFrontmatter(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const line of raw.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}
