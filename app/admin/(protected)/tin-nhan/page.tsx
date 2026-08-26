import type { Metadata } from 'next';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Quản lý tin nhắn | Admin' };

async function getMessages() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('id, name, email, phone, message, is_read, created_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

function truncate(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Quản lý tin nhắn</h1>
      <p className="text-sm text-gray-500 mb-8">Tin nhắn liên hệ từ khách truy cập website.</p>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {messages.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Chưa có tin nhắn nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Người gửi</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Liên hệ</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Nội dung</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Thời gian</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tin-nhan/${msg.id}`}
                      className={`font-medium hover:text-emerald-400 transition-colors ${
                        msg.is_read ? 'text-gray-300' : 'text-white'
                      }`}
                    >
                      {msg.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {msg.email && <div>{msg.email}</div>}
                    {msg.phone && <div>{msg.phone}</div>}
                    {!msg.email && !msg.phone && '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs">
                    <Link href={`/admin/tin-nhan/${msg.id}`} className="hover:text-white line-clamp-2">
                      {truncate(msg.message)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      msg.is_read
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {msg.is_read ? 'Đã đọc' : 'Chưa đọc'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
