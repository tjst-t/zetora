import type { Note, Link, SearchResult } from '@core/types';

export interface FileChangeEvent {
  type: 'create' | 'modify' | 'delete';
  noteId: string;
}

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
