'use client';

interface DeleteButtonProps {
  /** Server Action reference (already bound with the target id) */
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label?: string;
}

// Server Components can't attach onClick handlers directly to JSX — that's
// what caused "Event handlers cannot be passed to Client Component props"
// and crashed the whole /admin/kien-thuc and /admin/so-sanh list pages.
// This tiny Client Component is the fix: the confirm() dialog runs here,
// on the client, while the actual delete still goes through the Server
// Action passed in via `action` (Server Actions ARE safely serializable
// across the server → client boundary, unlike plain event handlers).
export default function DeleteButton({ action, confirmMessage, label = 'Xóa' }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
      >
        {label}
      </button>
    </form>
  );
}
