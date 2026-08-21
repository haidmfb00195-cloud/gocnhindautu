import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

// ── R2 Client (S3-compatible) ──────────────────────────────────────────────
// Endpoint format: https://<accountId>.r2.cloudflarestorage.com
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!; // e.g. https://cdn.gocnhindautu.com

// ── Upload ─────────────────────────────────────────────────────────────────

/**
 * Upload a file/buffer to Cloudflare R2.
 * @param key     Object key (path) in the bucket, e.g. "articles/my-slug.html"
 * @param body    The content to upload (Buffer, string, or ReadableStream)
 * @param contentType  MIME type, e.g. "text/html", "image/webp"
 * @param metadata  Optional key-value metadata stored alongside the object
 * @returns  The public CDN URL for the uploaded object
 */
export async function uploadToR2(
  key: string,
  body: PutObjectCommandInput['Body'],
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

// ── Download ───────────────────────────────────────────────────────────────

/**
 * Download an object from R2 and return its body as a string.
 * Used server-side to fetch article HTML before rendering.
 */
export async function getFromR2(key: string): Promise<string> {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`R2 object not found: ${key}`);
  }

  // Convert ReadableStream to string
  const stream = response.Body as Readable;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Download an object from R2 and return it as a raw Buffer.
 * Useful for binary files (images).
 */
export async function getBufferFromR2(key: string): Promise<Buffer> {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`R2 object not found: ${key}`);
  }

  const stream = response.Body as Readable;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

// ── Delete ─────────────────────────────────────────────────────────────────

/**
 * Delete an object from R2.
 * Called when an article/broker is deleted from admin panel.
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

// ── Presigned URL (optional — for temporary access) ────────────────────────

/**
 * Generate a presigned GET URL for private objects.
 * Default expiry: 1 hour.
 */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate the public CDN URL for a given R2 key without making an API call.
 */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Generate a unique key for article HTML content.
 * Format: articles/<slug>/<timestamp>.html
 */
export function makeArticleKey(slug: string): string {
  return `articles/${slug}/${Date.now()}.html`;
}

/**
 * Generate a unique key for broker review content.
 */
export function makeBrokerKey(slug: string): string {
  return `brokers/${slug}/${Date.now()}.html`;
}

/**
 * Generate a unique key for comparison content.
 */
export function makeComparisonKey(slug: string): string {
  return `comparisons/${slug}/${Date.now()}.html`;
}

/**
 * Generate a unique key for uploaded media.
 * Format: media/<year>/<month>/<filename>
 */
export function makeMediaKey(filename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `media/${year}/${month}/${filename}`;
}
