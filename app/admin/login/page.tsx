'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'forbidden'
      ? 'Tài khoản không có quyền admin.'
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('Email hoặc mật khẩu không đúng.');
      setLoading(false);
      return;
    }

    // Redirect to admin dashboard — middleware will verify role
    router.push('/admin');
    router.refresh();
  };

  return (
    <>
      <form
        id="admin-login-form"
        onSubmit={handleLogin}
        className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4"
      >
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {searchParams.get('redirected') && !error && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-sm text-yellow-400">
            Bạn cần đăng nhập để tiếp tục.
          </div>
        )}

        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            placeholder="admin@gocnhindautu.com"
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-1">
            Mật khẩu
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        <button
          id="admin-login-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {/* No registration link — admin accounts created manually in Supabase */}
      <p className="mt-4 text-center text-xs text-gray-600">
        Không hỗ trợ đăng ký tài khoản mới.
      </p>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-400">gocnhindautu.com</p>
        </div>
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
