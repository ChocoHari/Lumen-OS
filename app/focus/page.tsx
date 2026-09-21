import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { FocusTimer } from '@/components/FocusTimer';
import { RequireAuth } from '@/components/RequireAuth';

export default function FocusPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-bg p-5">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
          <Sidebar />
          <section>
            <TopBar title="Focus Timer" />
            <FocusTimer />
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
