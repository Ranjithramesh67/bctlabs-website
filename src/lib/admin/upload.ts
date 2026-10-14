import "server-only";

import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Persist an uploaded file under `public/<relativePath>` and return the
 * relative path (mirrors Laravel's `->move(public_path(...))`).
 */
export async function saveUpload(
  file: File,
  relativePath: string,
): Promise<string> {
  const target = path.join(process.cwd(), "public", relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target, buffer);
  return relativePath;
}

/** Remove a stored file if it exists (mirrors `unlink(public_path(...))`). */
export async function deleteUpload(relativePath: string | null): Promise<void> {
  if (!relativePath) {
    return;
  }
  const target = path.join(process.cwd(), "public", relativePath);
  try {
    await stat(target);
    await unlink(target);
  } catch {
    // File already gone.
  }
}

/** Whether a `File` form entry is present and non-empty. */
export function isUpload(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}
