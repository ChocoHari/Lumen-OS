import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AssignmentBoard } from '@/components/AssignmentBoard';
import { RequireAuth } from '@/components/RequireAuth';

export default function AssignmentsPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-bg p-5">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
          <Sidebar />
          <section>
            <TopBar title="Assignments" />
            <AssignmentBoard />
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
