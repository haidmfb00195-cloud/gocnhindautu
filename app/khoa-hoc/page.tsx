import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Khóa học Trading',
  description: 'Các khóa học trading từ cơ bản đến nâng cao dành cho trader Việt Nam.',
};

async function getCourses() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, published_at')
    .eq('status', 'published')
    .eq('category_id', 'khoa-hoc') // assumes a category with this slug exists
    .order('published_at', { ascending: false });
  return data ?? [];
}

export default async function KhoaHocPage() {
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Khóa học Trading</h1>
      <p className="text-gray-400 mb-10">Học từ cơ bản đến nâng cao — có hệ thống, có lộ trình.</p>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Khóa học đang được chuẩn bị, sắp ra mắt.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/khoa-hoc/${course.slug}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-emerald-500/50 transition-colors"
            >
              <h2 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                {course.title}
              </h2>
              {course.meta_description && (
                <p className="mt-2 text-sm text-gray-400 line-clamp-3">{course.meta_description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
