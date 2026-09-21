import { db, type Course } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function syncCoursesWithSupabase(userId: string) {
  if (!supabase) return;

  const localCourses = await db.courses.toArray();
  const payload = localCourses.map(({ id, ...course }) => ({ ...course, user_id: userId }));

  if (payload.length > 0) {
    await supabase.from('courses').upsert(payload, { onConflict: 'user_id,code' });
  }

  const { data } = await supabase.from('courses').select('*').eq('user_id', userId);
  if (!data) return;

  await db.transaction('rw', db.courses, async () => {
    await db.courses.clear();
    const normalized: Course[] = data.map((course) => ({
      id: course.id,
      userId: course.user_id,
      code: course.code,
      name: course.name,
      lecturer: course.lecturer,
      room: course.room,
      credits: course.credits,
      progress: course.progress,
      createdAt: course.created_at
    }));
    await db.courses.bulkPut(normalized);
  });
}
