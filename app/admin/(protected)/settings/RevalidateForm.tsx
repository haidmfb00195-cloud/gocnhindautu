'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { manualRevalidateAction } from './actions';

const initialState = {
  error: null as string | null,
  success: null as string | null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      id="submit-revalidate"
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:text-gray-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
    >
      {pending ? 'Đang gửi...' : 'Revalidate'}
    </button>
  );
}

export default function RevalidateForm() {
  const [state, formAction] = useFormState(manualRevalidateAction as any, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label htmlFor="revalidate-path" className="block text-sm font-medium text-gray-300 mb-1">
            Đường dẫn (Path)
          </label>
          <input
            id="revalidate-path"
            name="path"
            type="text"
            required
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
            placeholder="Ví dụ: / hoặc /so-sanh/xm-vs-exness"
          />
        </div>
        <div>
          <label htmlFor="revalidate-type" className="block text-sm font-medium text-gray-300 mb-1">
            Kiểu (Type)
          </label>
          <select
            id="revalidate-type"
            name="type"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none text-sm"
          >
            <option value="page">Page</option>
            <option value="layout">Layout</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-950/30 border border-red-900/50 p-4 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/50 p-4 text-sm text-emerald-400">
          {state.success}
        </div>
      )}
    </form>
  );
}
