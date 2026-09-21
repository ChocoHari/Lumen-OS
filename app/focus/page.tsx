import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { FocusTimer } from '@/components/FocusTimer';

export default function FocusPage() {
  return (
    <main className="min-h-screen bg-bg p-5">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <section>
          <TopBar title="Focus Timer" />
          <FocusTimer />
        </section>
      </div>
    </main>
  );
}
