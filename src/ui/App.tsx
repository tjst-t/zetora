export function App() {
  return (
    <div className="flex h-screen bg-surface-0 text-[var(--text)]">
      <aside className="w-64 bg-surface-1 border-r border-surface-2 p-4">
        <h1 className="text-lg font-bold mb-4">Zetora</h1>
        <p className="text-[var(--text-muted)] text-sm">No vault opened</p>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Open or create a vault to get started</p>
      </main>
    </div>
  );
}
