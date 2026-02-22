# Zetora Architecture

## Overview

Zetora is a local-first knowledge management app. The primary design goals are:

1. **Module boundaries with clean interfaces** — monolithic but modular, ready for future plugin extraction
2. **Local-first** — all data stored as Markdown files + SQLite metadata
3. **Cross-platform** — shared React frontend for both Tauri desktop and web

## Module Structure

```
src/
├── core/           # Platform-agnostic business logic
│   ├── types.ts        # Shared type definitions
│   ├── note.ts         # Note CRUD operations
│   ├── link-parser.ts  # [[wikilink]] parsing and extraction
│   ├── search.ts       # Search interface
│   └── vault.ts        # Vault (workspace) management
│
├── editor/         # Editor module
│   ├── Editor.tsx          # Main editor component
│   ├── extensions/         # TipTap extensions
│   │   ├── wikilink.ts     # [[wikilink]] node extension
│   │   └── frontmatter.ts  # YAML frontmatter support
│   └── hooks/
│       └── useEditor.ts    # Editor state hook
│
├── graph/          # Graph visualization
│   ├── GraphView.tsx       # Graph component
│   ├── graph-data.ts       # Graph data transformation
│   └── layout.ts           # Layout algorithms
│
├── ui/             # Shell and shared UI
│   ├── App.tsx             # Root component
│   ├── Layout.tsx          # Main layout (sidebar + editor + panels)
│   ├── Sidebar.tsx         # File tree / navigation
│   ├── CommandPalette.tsx  # Cmd+K command palette
│   ├── BacklinkPanel.tsx   # Backlink display panel
│   └── SearchPanel.tsx     # Search UI
│
└── platform/       # Platform abstraction layer
    ├── types.ts            # Platform interface definitions
    ├── tauri.ts            # Tauri implementation (file I/O, SQLite)
    └── web.ts              # Web implementation (IndexedDB, OPFS)
```

## Module Interfaces

### Core Types (`core/types.ts`)

```typescript
export interface Note {
  id: string;              // filename without extension
  title: string;
  content: string;         // raw Markdown
  frontmatter: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  source: string;   // note id
  target: string;   // note id
  context: string;  // surrounding text for preview
  position: { line: number; col: number };
}

export interface SearchResult {
  noteId: string;
  title: string;
  snippet: string;   // highlighted match context
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
  weight: number;  // number of links between the two notes
}
```

### Platform Interface (`platform/types.ts`)

This is the key abstraction that enables both Tauri and Web targets:

```typescript
export interface PlatformAPI {
  // File operations
  readNote(id: string): Promise<Note>;
  writeNote(id: string, content: string): Promise<void>;
  deleteNote(id: string): Promise<void>;
  listNotes(): Promise<Note[]>;
  watchChanges(callback: (event: FileChangeEvent) => void): () => void;

  // Search index
  indexNote(note: Note, links: Link[]): Promise<void>;
  removeFromIndex(id: string): Promise<void>;
  search(query: string): Promise<SearchResult[]>;

  // Link index
  getBacklinks(noteId: string): Promise<Link[]>;
  getForwardLinks(noteId: string): Promise<Link[]>;
  getAllLinks(): Promise<Link[]>;
  getUnlinkedMentions(noteId: string): Promise<Link[]>;

  // Vault
  openVault(path: string): Promise<void>;
  getVaultPath(): Promise<string>;
}
```

### Editor Interface

```typescript
export interface EditorAPI {
  getContent(): string;
  setContent(content: string): void;
  insertLink(noteId: string): void;
  onContentChange(callback: (content: string) => void): () => void;
  focus(): void;
}
```

### Graph Interface

```typescript
export interface GraphAPI {
  setData(nodes: GraphNode[], edges: GraphEdge[]): void;
  focusNode(nodeId: string): void;
  onNodeClick(callback: (nodeId: string) => void): () => void;
  getLayout(): GraphLayout;
  setLayout(layout: GraphLayout): void;
}

export type GraphLayout = 'force' | 'radial' | 'hierarchical';
```

## Data Flow

```
User edits note in Editor
  → Editor emits content change
  → core/link-parser extracts [[wikilinks]]
  → platform.writeNote() saves to filesystem
  → platform.indexNote() updates SQLite FTS + link index
  → BacklinkPanel re-queries backlinks
  → GraphView re-renders with updated links
```

## Storage

### File Format

Standard Markdown files with optional YAML frontmatter:

```markdown
---
tags: [rust, programming]
created: 2025-01-15
---

# My Note Title

This links to [[another-note]] and [[yet-another]].
```

### SQLite Schema

```sql
-- Full-text search
CREATE VIRTUAL TABLE notes_fts USING fts5(
  id,
  title,
  content,
  tokenize='unicode61'
);

-- Link index
CREATE TABLE links (
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  context TEXT,
  line INTEGER,
  col INTEGER,
  PRIMARY KEY (source, target, line)
);

CREATE INDEX idx_links_target ON links(target);

-- Note metadata cache
CREATE TABLE notes_meta (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  frontmatter_json TEXT
);
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Desktop shell | Tauri v2 | Lightweight, Rust backend, native file access |
| Frontend | React + TypeScript | Ecosystem, learning value |
| Editor | TipTap (ProseMirror) | Extensible, structured editing |
| Graph | D3.js or Cytoscape.js | TBD based on Phase 2 evaluation |
| State | Zustand | Simple, minimal boilerplate |
| Styling | Tailwind CSS | Rapid prototyping |
| Search DB | SQLite (FTS5) | Fast full-text search, Tauri sql plugin |
| Build | Vite | Fast HMR, shared config for web + Tauri |
| Package manager | pnpm | Fast, strict, workspace support |

## Development Phases

### Phase 1: Foundation (2-3 weeks)
- Tauri + React + TipTap basic Markdown editor
- Local file read/write via platform abstraction
- Basic sidebar with file list

### Phase 2: Knowledge Graph (2-3 weeks)
- [[wikilink]] parser implementation
- SQLite link index
- Backlink panel
- Graph view

### Phase 3: Smart Search (1-2 weeks)
- SQLite FTS5 full-text search
- Unlinked mention detection
- Command palette (Cmd+K)

### Phase 4: Polish & Web (2-3 weeks)
- Web platform implementation (IndexedDB / OPFS)
- Same frontend served via Vite for web
- UI polish, keyboard shortcuts, themes
