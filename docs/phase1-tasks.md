# Phase 1: Foundation - Detailed Task Breakdown

This document breaks Phase 1 into individual tasks suitable for Claude Code sessions.

## Task 1.1: Tauri Initialization

```
pnpm tauri init
```

Configuration:
- App name: `Zetora`
- Window title: `Zetora`
- Identifier: `com.zetora.app`
- Dev server URL: `http://localhost:1420`
- Dev command: `pnpm dev`
- Build command: `pnpm build`

After init, add Tauri plugins to `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
```

Register plugins in `src-tauri/src/lib.rs`:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_sql::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

Also install JS bindings:

```bash
pnpm add @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-sql
```

Verify: `pnpm tauri dev` opens a window showing the current App.tsx shell.

## Task 1.2: Zustand Store

Create `src/ui/store.ts`:

```typescript
import { create } from 'zustand';
import type { Note } from '@core/types';

interface AppState {
  vaultPath: string | null;
  notes: Note[];
  activeNoteId: string | null;
  
  setVaultPath: (path: string) => void;
  setNotes: (notes: Note[]) => void;
  setActiveNoteId: (id: string | null) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
}
```

Keep it simple. No async logic in the store — async operations go through PlatformAPI, and components update the store with results.

## Task 1.3: Tauri Platform Implementation

Create `src/platform/tauri.ts` implementing `PlatformAPI`.

For Phase 1, only these methods need real implementations:
- `readNote(id)` — read `{vaultPath}/{id}.md`, parse with `parseNote()`
- `writeNote(id, content)` — write to `{vaultPath}/{id}.md`
- `deleteNote(id)` — delete `{vaultPath}/{id}.md`
- `listNotes()` — read directory, filter `.md` files, parse each
- `openVault(path)` — store vault path, trigger initial indexing
- `getVaultPath()` — return stored path

Stub the rest (search, links) to return empty arrays.

Use `@tauri-apps/plugin-fs` for file operations:
```typescript
import { readTextFile, writeTextFile, readDir, remove } from '@tauri-apps/plugin-fs';
```

## Task 1.4: Editor Component

Create `src/editor/Editor.tsx`:

- Use `useEditor` hook from `@tiptap/react`
- Extensions: StarterKit (includes basic Markdown support)
- Load content from active note via PlatformAPI
- Save on Ctrl+S / Cmd+S
- Debounced auto-save (2 seconds after last edit)
- Emit content changes for future use by link parser

Consider adding `@tiptap/extension-placeholder` for empty state.

IMPORTANT: TipTap works with HTML internally. For Markdown round-trip:
- Option A: Use a Markdown-to-HTML converter on load, HTML-to-Markdown on save. Use `turndown` (HTML→MD) and `marked` (MD→HTML).
- Option B: Use `@tiptap/extension-markdown` (if it exists and is stable).

Evaluate both options and pick the one with better fidelity for wikilinks.

## Task 1.5: Sidebar

Create `src/ui/Sidebar.tsx`:

- Show vault name at top
- "Open Vault" button (uses `@tauri-apps/plugin-dialog` open directory)
- List of notes sorted alphabetically
- Click to set activeNoteId in store
- "New Note" button — prompt for title, create file, open in editor
- Active note highlighted

## Task 1.6: Layout Integration

Update `src/ui/App.tsx` and create `src/ui/Layout.tsx`:

- Three-column layout: Sidebar (fixed 256px) | Editor (flex) | Right Panel (fixed 300px, collapsible)
- Right panel is empty in Phase 1 (will be BacklinkPanel in Phase 2)
- Platform provider: create a React context that provides PlatformAPI instance

```typescript
// src/platform/context.ts
import { createContext, useContext } from 'react';
import type { PlatformAPI } from './types';

const PlatformContext = createContext<PlatformAPI | null>(null);

export const PlatformProvider = PlatformContext.Provider;

export function usePlatform(): PlatformAPI {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('PlatformProvider not found');
  return ctx;
}
```

## Completion Checklist

- [ ] `pnpm tauri dev` launches window
- [ ] Can open a folder as vault via dialog
- [ ] Sidebar lists .md files in the vault
- [ ] Clicking a file loads its content in TipTap editor
- [ ] Editing + Ctrl+S saves back to disk
- [ ] Can create new notes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
