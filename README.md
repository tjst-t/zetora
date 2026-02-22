# Zetora

A knowledge management app with bidirectional links and graph view.

Built with **Tauri v2 + React + TypeScript**.

## Features (Planned)

- Markdown editor (TipTap / ProseMirror)
- `[[wikilink]]` bidirectional links
- Graph view of note connections
- Full-text search (SQLite FTS5)
- Unlinked mention detection
- Local-first, file-based storage (Obsidian-compatible Markdown)
- Web + Desktop (shared frontend)

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full design.

```
src/
  core/       # File I/O, link parsing, search index
  editor/     # TipTap-based Markdown editor
  graph/      # Graph view (D3/Cytoscape)
  ui/         # Layout, sidebar, command palette
```

## Development

### Prerequisites

- Node.js >= 20
- Rust >= 1.75
- pnpm >= 9

### Setup

```bash
pnpm install
pnpm tauri dev
```

### Web-only dev

```bash
pnpm dev
```

## License

MIT
