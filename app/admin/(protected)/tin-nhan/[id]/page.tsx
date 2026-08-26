import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import DeleteMessageButton from '@/components/admin/DeleteMessageButton';

export const metadata: Metadata = { title: 'Chi tiết tin nhắn | Admin' };

interface Props {
  params: { id: string };
}

async function getMessage(id: string) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) return null;

  if (!data.is_read) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    data.is_read = true;
  }

  return data;
}

export default async function MessageDetailPage({ params }: Props) {
  const message = await getMessage(params.id);
  if (!message) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/tin-nhan" className="text-sm text-gray-400 hover:text-white">
        ← Danh sách tin nhắn
      </Link>

      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{message.name}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            message.is_read ? 'bg-gray-700 text-gray-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {message.is_read ? 'Đã đọc' : 'Chưa đọc'}
          </span>
        </div>

        <dl className="space-y-4 mb-6">
          {message.email && (
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</dt>
              <dd>
                <a href={`mailto:${message.email}`} className="text-emerald-400 hover:underline">
                  {message.email}
                </a>
              </dd>
            </div>
          )}
          {message.phone && (
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">Số điện thoại</dt>
              <dd>
                <a href={`tel:${message.phone.replace(/\s/g, '')}`} className="text-emerald-400 hover:underline">
                  {message.phone}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nội dung</dt>
            <dd className="text-gray-300 whitespace-pre-wrap leading-relaxed">{message.message}</dd>
          </div>
        </dl>

        <DeleteMessageButton id={message.id} name={message.name} />
      </div>
    </div>
  );
}
