// Strip zero-width characters that Quill / some IMEs / copy-paste from Word
// silently inject into contentEditable HTML:
//   \u200B ZERO WIDTH SPACE
//   \u200C ZERO WIDTH NON-JOINER
//   \u200D ZERO WIDTH JOINER
//   \uFEFF BYTE ORDER MARK / ZERO WIDTH NO-BREAK SPACE
//
// This is the exact root cause of the Vietnamese word-break bug found
// earlier on cokhiapec.com (ZWSP injected by Quill, never stripped at
// save-time before the R2 upload). Stripped in TWO places here as
// defense in depth:
//   1. Client-side, on every Quill change (components/admin/QuillEditor.tsx)
//   2. Server-side, right before DOMPurify.sanitize (lib/actions/articles.ts)
// Never rely on only one side — client-side strip can be bypassed by any
// direct API call, and server-side alone still lets a "dirty" preview
// render in the editor before save.
const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\uFEFF]/g;

export function stripZeroWidth(input: string): string {
  if (!input) return input;
  return input.replace(ZERO_WIDTH_RE, '');
}
