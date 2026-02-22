export interface Note {
  id: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  source: string;
  target: string;
  context: string;
  position: { line: number; col: number };
}

export interface SearchResult {
  noteId: string;
  title: string;
  snippet: string;
  score: number;
}

export interface GraphNode {
  id: string;
  title: string;
  linkCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}
