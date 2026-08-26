'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
          website: formData.get('website'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setErrorMsg('Lỗi kết nối — vui lòng thử lại sau.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
        <p className="text-foreground font-semibold mb-2">Đã gửi tin nhắn thành công!</p>
        <p className="text-text-secondary text-sm">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot — ẩn khỏi người dùng thật */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium mb-1 text-foreground">
          Họ tên *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary"
          placeholder="Nhập họ tên của bạn"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium mb-1 text-foreground">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          maxLength={200}
          className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary"
          placeholder="Email của bạn"
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium mb-1 text-foreground">
          Số điện thoại
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          maxLength={20}
          className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary"
          placeholder="+84 ..."
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-1 text-foreground">
          Nội dung *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          className="w-full bg-background-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary resize-none"
          placeholder="Chi tiết lời nhắn..."
        />
      </div>

      {status === 'error' && errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn bg-primary hover:bg-primary-hover text-black font-bold w-full py-3 rounded-lg mt-2 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'ĐANG GỬI...' : 'GỬI TIN NHẮN'}
      </button>
    </form>
  );
}
