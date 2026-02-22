# CLAUDE.md - Zetora Development Guide

## Project Overview

Zetora is a local-first knowledge management app (like Obsidian/Logseq) built with Tauri v2 + React + TypeScript. The primary goal is full-stack learning while building a usable product.

Repository: https://github.com/tjst-t/zetora

## Architecture

See `docs/architecture.md` for full design. Key points:

- **Monolithic but modular**: Clean interfaces between modules, no plugin system yet
- **Platform abstraction**: `src/platform/types.ts` defines `PlatformAPI` interface. Tauri and Web implementations are separate
- **Local-first**: Markdown files on disk + SQLite for search/link index
- Module path aliases: `@core/`, `@editor/`, `@graph/`, `@ui/`, `@platform/`

## Tech Stack

- **Desktop**: Tauri v2 (Rust backend)
- **Frontend**: React 19 + TypeScript
- **Editor**: TipTap (ProseMirror-based)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Search**: SQLite FTS5
- **Build**: Vite + pnpm

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Vite dev server (web only)
pnpm tauri dev        # Tauri desktop dev
pnpm build            # Production build
pnpm tauri build      # Desktop production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
```

## Directory Structure

```
src/
  core/           # Business logic (Note, Link, Search types and utils)
  editor/         # TipTap editor component and extensions
  graph/          # Graph visualization (D3/Cytoscape)
  ui/             # App shell, layout, sidebar, panels
  platform/       # Platform abstraction (Tauri impl / Web impl)
src-tauri/        # Tauri Rust backend (after `pnpm tauri init`)
docs/             # Architecture and design docs
```

## Key Interfaces

All module communication goes through typed interfaces:

- `PlatformAPI` (`src/platform/types.ts`) - File I/O, search, link index
- `Note`, `Link`, `SearchResult`, `GraphNode`, `GraphEdge` (`src/core/types.ts`)

When adding features, always check if the interface needs to be extended first, then implement.

## Coding Conventions

- TypeScript strict mode is enabled
- Use functional components with hooks
- Prefer named exports over default exports
- Use path aliases (`@core/types` not `../../core/types`)
- Keep platform-specific code strictly inside `src/platform/`
- CSS: use Tailwind utilities + CSS custom properties defined in `src/index.css`
- No `any` types. Use `unknown` + type guards if needed

## Development Phases

### Phase 1: Foundation (Current)

Goal: Basic Markdown editor with local file read/write.

Tasks:
1. Run `pnpm tauri init` to create `src-tauri/` directory
   - App name: "Zetora", identifier: "com.zetora.app"
   - Window title: "Zetora"
2. Implement `src/platform/tauri.ts` (TauriPlatformAPI)
   - Use `@tauri-apps/plugin-fs` for file operations
   - Use `@tauri-apps/plugin-dialog` for vault folder selection
   - Stub search/link methods (return empty arrays for now)
3. Build `src/editor/Editor.tsx`
   - TipTap editor with StarterKit
   - Markdown serialization on save (Ctrl+S)
   - Load note content from PlatformAPI
4. Build `src/ui/Layout.tsx`
   - Three-panel layout: sidebar (file list) + editor + right panel (empty for now)
   - Resizable panels
5. Build `src/ui/Sidebar.tsx`
   - List all .md files from vault
   - Click to open in editor
   - New note button
6. Wire up Zustand store
   - Current vault path
   - Open note id
   - Note list

Acceptance criteria:
- User can open a folder as vault
- Sidebar shows all .md files
- Clicking a file opens it in the TipTap editor
- Editing and saving persists to disk
- Works in Tauri desktop window

### Phase 2: Knowledge Graph

Goal: Bidirectional links and graph visualization.

Tasks:
1. Create TipTap extension for `[[wikilink]]` syntax
   - Inline decoration / node view
   - Autocomplete on `[[` trigger
   - Click to navigate
2. Implement SQLite link index
   - Use `@tauri-apps/plugin-sql` with SQLite
   - Schema from `docs/architecture.md`
   - On note save: parse links → update index
3. Build `src/ui/BacklinkPanel.tsx`
   - Show backlinks for current note in right panel
   - Each backlink shows context snippet
4. Build `src/graph/GraphView.tsx`
   - Force-directed graph of all notes and links
   - Click node to navigate to note
   - Highlight current note

### Phase 3: Smart Search

Goal: Fast full-text search and unlinked mention detection.

Tasks:
1. Implement FTS5 indexing in platform layer
2. Build `src/ui/SearchPanel.tsx` with live results
3. Build `src/ui/CommandPalette.tsx` (Cmd+K)
4. Implement unlinked mention detection
   - Scan all notes for occurrences of note titles not wrapped in `[[]]`

### Phase 4: Web Platform & Polish

Goal: Web version with same frontend.

Tasks:
1. Implement `src/platform/web.ts` using IndexedDB or OPFS
2. Keyboard shortcuts (Cmd+N, Cmd+P, Cmd+S, etc.)
3. Dark/light theme toggle
4. Daily note feature

## Important Notes

- Always run `pnpm typecheck` after changes to verify type safety
- The `PlatformAPI` interface is the contract between frontend and backend. Discuss interface changes before implementing
- Wikilink format: `[[note-id]]` or `[[note-id|display text]]`. IDs are lowercase kebab-case
- Note IDs are derived from filenames (without .md extension)
- Frontmatter parser in `src/core/note.ts` is intentionally simple (no YAML library). Replace with `yaml` package if it becomes insufficient
