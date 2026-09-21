export function TopBar({ title }: { title: string }) {
  return (
    <header className="mb-5 rounded-xl2 border border-gray-100 bg-white px-5 py-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-xs text-gray-500">Offline-first workspace for focused learning</p>
    </header>
  );
}
