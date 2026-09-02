'use client';

import { useCallback, useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import type ReactQuillType from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createClient } from '@/lib/supabase/client';
import { stripZeroWidth } from '@/lib/utils/text';

// react-quill touches `document`, so it must never render on the server.
// Wrap with forwardRef shim so TypeScript accepts the `ref` prop.
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // eslint-disable-next-line react/display-name
    return forwardRef<ReactQuillType, React.ComponentProps<typeof RQ>>((props, ref) => (
      <RQ {...props} ref={ref as any} />
    ));
  },
  { ssr: false }
);

interface InternalLinkTarget {
  title: string;
  href: string;
}

interface QuillEditorProps {
  /** name of the hidden form field the Server Action reads on submit */
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export default function QuillEditor({ name, defaultValue = '', placeholder }: QuillEditorProps) {
  const [html, setHtml] = useState(defaultValue);
  const quillRef = useRef<ReactQuillType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<{ index: number; length: number } | null>(null);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkQuery, setLinkQuery] = useState('');
  const [linkResults, setLinkResults] = useState<InternalLinkTarget[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // ZWSP stripped on every keystroke — see lib/utils/text.ts for why.
  const handleChange = useCallback((value: string) => {
    setHtml(stripZeroWidth(value));
  }, []);

  // ── Inline image upload (toolbar image button) ───────────────────────
  const imageHandler = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (editor) savedRangeRef.current = editor.getSelection(true);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    const range = savedRangeRef.current ?? editor.getSelection(true) ?? { index: editor.getLength(), length: 0 };

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Upload ảnh thất bại');
        return;
      }
      editor.insertEmbed(range.index, 'image', data.url, 'user');
      editor.setSelection(range.index + 1, 0);
    } catch {
      alert('Lỗi kết nối khi upload ảnh — thử lại nhé.');
    }
  };

  // ── Internal link picker ───────────────────────────────────────────────
  const openLinkModal = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    const range = editor?.getSelection();
    if (!range || range.length === 0) {
      alert('Bôi đen đoạn text muốn chèn link nội bộ trước đã bro.');
      return;
    }
    savedRangeRef.current = range;
    setLinkQuery('');
    setLinkResults([]);
    setLinkError(null);
    setLinkModalOpen(true);
  }, []);

  // Debounced search over published articles as the admin types.
  useEffect(() => {
    if (!linkModalOpen) return;
    const timeout = setTimeout(async () => {
      setLinkLoading(true);
      setLinkError(null);
      try {
        const supabase = createClient();
        let query = supabase
          .from('articles')
          .select('title, slug, categories(slug)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(8);
        if (linkQuery.trim()) {
          query = query.ilike('title', `%${linkQuery.trim()}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        setLinkResults(
          (data ?? []).map((a: any) => ({
            title: a.title,
            href: `/kien-thuc/${a.categories?.slug ?? 'chung'}/${a.slug}`,
          }))
        );
      } catch {
        setLinkError('Không tải được danh sách bài viết.');
      } finally {
        setLinkLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [linkModalOpen, linkQuery]);

  const insertInternalLink = (href: string) => {
    const editor = quillRef.current?.getEditor?.();
    const range = savedRangeRef.current;
    if (editor && range) {
      editor.formatText(range.index, range.length, 'link', href, 'user');
      setHtml(stripZeroWidth(editor.root.innerHTML));
    }
    setLinkModalOpen(false);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          Toolbar "link" (🔗) = link ngoài. Dùng nút bên dưới để chèn link nội bộ.
        </span>
        <button
          type="button"
          onClick={openLinkModal}
          className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
        >
          🔗 Chèn link nội bộ
        </button>
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={html}
        onChange={handleChange}
        modules={modules}
        placeholder={placeholder}
        className="[&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-gray-700 [&_.ql-toolbar]:bg-gray-900 [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-gray-700 [&_.ql-container]:bg-gray-800 [&_.ql-editor]:h-[60vh] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-white [&_.ql-picker-label]:text-gray-300 [&_.ql-stroke]:stroke-gray-400 [&_.ql-fill]:fill-gray-400"
      />

      {/* Hidden field — this is what the Server Action actually reads on submit */}
      <input type="hidden" name={name} value={html} readOnly />

      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Chèn link nội bộ</h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={linkQuery}
              onChange={(e) => setLinkQuery(e.target.value)}
              placeholder="Tìm bài viết theo tiêu đề..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white mb-3 focus:border-emerald-500 focus:outline-none"
            />
            <div className="max-h-64 overflow-auto space-y-1">
              {linkLoading && <p className="text-xs text-gray-500 px-1">Đang tìm...</p>}
              {linkError && <p className="text-xs text-red-400 px-1">{linkError}</p>}
              {!linkLoading && !linkError && linkResults.length === 0 && (
                <p className="text-xs text-gray-500 px-1">Không tìm thấy bài viết nào đã xuất bản.</p>
              )}
              {linkResults.map((r) => (
                <button
                  type="button"
                  key={r.href}
                  onClick={() => insertInternalLink(r.href)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span className="block truncate">{r.title}</span>
                  <span className="block text-xs text-gray-600 truncate">{r.href}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
