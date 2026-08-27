import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'medical-records';

// ─────────────────────────────────────────────
//  Generate a signed download URL for a file.
//  Used by the provider portal after grant validation.
//  expiresIn: seconds (default 1 hour)
// ─────────────────────────────────────────────
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
  if (!filePath) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) return null;
  return data.signedUrl;
}

// ─────────────────────────────────────────────
//  Format file size for display
// ─────────────────────────────────────────────
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────
//  Derive file type label from MIME or extension
// ─────────────────────────────────────────────
export function getFileTypeLabel(fileType: string | null, fileName: string | null): string {
  if (fileType === 'pdf') return 'PDF';
  if (fileType === 'docx') return 'DOCX';
  if (fileType === 'image') return 'Image';
  // Fallback: derive from filename extension
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return 'Image';
  return 'File';
}

// ─────────────────────────────────────────────
//  Derive file_type string from MIME type
// ─────────────────────────────────────────────
export function mimeToFileType(mime: string): 'pdf' | 'docx' | 'image' {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word') || mime.includes('document')) return 'docx';
  return 'image';
}
