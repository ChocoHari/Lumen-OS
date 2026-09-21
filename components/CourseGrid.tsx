'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { db, type Course } from '@/lib/db';

const emptyCourse: Omit<Course, 'createdAt' | 'updatedAt' | 'userId'> = {
  code: '',
  name: '',
  lecturer: '',
  room: '',
  credits: 3,
  progress: 0
};

export function CourseGrid() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyCourse);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    db.courses.where('userId').equals(user.id).toArray().then(setCourses);
  }, [user]);

  async function addCourse() {
    const now = new Date().toISOString();
    await db.courses.add({ ...form, userId: user?.id, createdAt: now, updatedAt: now });
    if (user) {
      setCourses(await db.courses.where('userId').equals(user.id).toArray());
    }
    setForm(emptyCourse);
    setIsOpen(false);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Courses</h2>
        <button onClick={() => setIsOpen(true)} className="rounded-xl2 bg-black px-4 py-2 text-sm text-white">
          Add Course
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="rounded-xl2 border border-gray-100 bg-white p-4 transition hover:shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium">{course.code}</span>
              <span className="text-xs text-gray-500">{course.credits} credits</span>
            </div>
            <p className="font-semibold">{course.name}</p>
            <p className="text-xs text-gray-500">{course.lecturer}</p>
            <p className="text-xs text-gray-500">Room {course.room}</p>
            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-black" style={{ width: `${course.progress}%` }} />
            </div>
          </Link>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-xl3 border border-gray-100 bg-white p-5">
            <h3 className="mb-4 text-lg font-semibold">Add course</h3>
            <div className="grid gap-3 text-sm">
              {[
                { key: 'code', type: 'text' },
                { key: 'name', type: 'text' },
                { key: 'lecturer', type: 'text' },
                { key: 'room', type: 'text' },
                { key: 'credits', type: 'number' },
                { key: 'progress', type: 'number' }
              ].map(({ key, type }) => (
                <label key={key} className="grid gap-1 capitalize">
                  {key}
                  <input
                    type={type}
                    value={String(form[key as keyof typeof form])}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: type === 'number' ? Number(e.target.value) : e.target.value
                      }))
                    }
                    className="rounded-xl2 border border-gray-200 px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="rounded-xl2 border border-gray-200 px-3 py-2 text-sm">
                Cancel
              </button>
              <button onClick={addCourse} className="rounded-xl2 bg-black px-3 py-2 text-sm text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
