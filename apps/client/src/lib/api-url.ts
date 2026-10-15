export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Uploads files to /api/uploads with a hard timeout.
 */
export async function uploadFilesWithTimeout(
  files: File[],
  { timeoutMs = 3 * 60 * 1000 }: { timeoutMs?: number } = {}
): Promise<{ ok: boolean; data: any }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = new FormData();
    files.forEach((file) => body.append('files', file));

    const res = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      credentials: 'include',
      body,
      signal: controller.signal,
    });

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, data: { error: 'Upload timed out. Please try a smaller file or check your connection.' } };
    }
    return { ok: false, data: { error: 'Upload failed. Please try again.' } };
  } finally {
    clearTimeout(timeout);
  }
}