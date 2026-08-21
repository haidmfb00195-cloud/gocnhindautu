import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToR2, makeMediaKey } from '@/lib/r2';

// Allowed MIME types for image upload
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/admin/upload
 *
 * Server-side image upload to Cloudflare R2.
 * R2 credentials are NEVER exposed to the client — all operations happen here.
 *
 * Requires: authenticated admin session
 * Body: multipart/form-data with 'file' field
 *
 * Returns: { url: string, key: string }
 */
export async function POST(request: NextRequest) {
  // Verify admin session
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'No file provided — include a "file" field in FormData' },
      { status: 400 }
    );
  }

  // Validate MIME type (check both declared type and file signature)
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Invalid file type: ${file.type}. Allowed: image/jpeg, image/png, image/webp`,
      },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 5MB`,
      },
      { status: 400 }
    );
  }

  // Validate file signature (magic bytes) for additional security
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isValidImageBuffer(buffer, file.type)) {
    return NextResponse.json(
      { error: 'File content does not match declared MIME type' },
      { status: 400 }
    );
  }

  // Sanitize filename — strip path traversal and special chars
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const key = makeMediaKey(safeName);

  try {
    const url = await uploadToR2(key, buffer, file.type, {
      'uploaded-by': user.id,
      'original-name': originalName,
    });

    return NextResponse.json({ url, key }, { status: 201 });
  } catch (err) {
    console.error('[upload] R2 upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed — please try again' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate image buffer magic bytes to prevent MIME type spoofing.
 */
function isValidImageBuffer(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case 'image/jpeg':
      // JPEG starts with FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case 'image/png':
      // PNG starts with 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );

    case 'image/webp':
      // WebP: starts with RIFF....WEBP
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer.length >= 12 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );

    default:
      return false;
  }
}
