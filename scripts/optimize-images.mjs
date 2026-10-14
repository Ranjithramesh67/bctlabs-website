#!/usr/bin/env node
/**
 * In-place raster image optimizer.
 *
 * The legacy site shipped raw camera originals (up to ~9500px / 18MB) and
 * multi-frame GIFs (a 150-frame / 52MB slider). Because every image path is
 * stored in the database, filenames cannot change, so this tool rewrites the
 * files in place: same path, same extension, same format, just downsized and
 * recompressed. Originals are recoverable from the Laravel reference copy at
 * /tmp/opencode/bctlabs_laravel/.../public_html/public.
 *
 * Usage:
 *   node scripts/optimize-images.mjs [--dir public] [--max 1920]
 *        [--min-bytes 204800] [--quality 80] [--concurrency 3]
 *        [--dry] [--limit N] [--only substr]
 */
import { readdirSync, statSync, renameSync, writeFileSync, unlinkSync } from "node:fs";
import { join, extname, relative } from "node:path";
import process from "node:process";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
};

const DIR = flag("dir", "public");
const MAX_DIM = Number(flag("max", 1920));
const MIN_BYTES = Number(flag("min-bytes", 200 * 1024));
const QUALITY = Number(flag("quality", 80));
const CONCURRENCY = Number(flag("concurrency", 3));
const DRY = Boolean(flag("dry", false));
const LIMIT = flag("limit", null) ? Number(flag("limit")) : Infinity;
const ONLY = flag("only", null);

const RASTER = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (RASTER.has(extname(entry.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

function encode(pipeline, ext, animated) {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true });
    case ".png":
      return pipeline.png({ compressionLevel: 9, effort: 8, progressive: true });
    case ".webp":
      return pipeline.webp({ quality: QUALITY, effort: 5 });
    case ".gif":
      return animated ? pipeline.gif({ effort: 3 }) : pipeline.gif();
    default:
      return pipeline;
  }
}

const stats = { processed: 0, skipped: 0, saved: 0, before: 0, after: 0, failed: 0 };

async function optimize(file) {
  const ext = extname(file).toLowerCase();
  const before = statSync(file).size;

  let meta;
  try {
    meta = await sharp(file, { animated: true }).metadata();
  } catch {
    stats.failed += 1;
    return;
  }

  const pages = meta.pages ?? 1;
  const animated = pages > 1;
  // For animated images sharp reports the whole filmstrip in `height`
  // (frames stacked vertically), so the real frame height is height / pages.
  const frameHeight = Math.round((meta.height ?? 0) / pages);
  const longest = Math.max(meta.width ?? 0, animated ? frameHeight : (meta.height ?? 0));
  if (before < MIN_BYTES && longest <= MAX_DIM) {
    stats.skipped += 1;
    return;
  }

  let pipeline = sharp(file, { animated });
  if (longest > MAX_DIM) {
    // Resize animated images by width only; resizing a filmstrip by height
    // would squash every frame.
    const resize =
      animated || (meta.width ?? 0) >= (meta.height ?? 0)
        ? { width: MAX_DIM }
        : { height: MAX_DIM };
    pipeline = pipeline.resize({ ...resize, withoutEnlargement: true });
  }

  let out;
  try {
    out = await encode(pipeline, ext, animated).toBuffer();
  } catch {
    stats.failed += 1;
    return;
  }

  // Only replace when meaningfully smaller; never regress a file.
  if (out.length >= before * 0.98) {
    stats.skipped += 1;
    return;
  }

  stats.processed += 1;
  stats.before += before;
  stats.after += out.length;
  stats.saved += before - out.length;

  const pct = ((1 - out.length / before) * 100).toFixed(0);
  console.log(
    `${(before / 1048576).toFixed(2)}MB -> ${(out.length / 1024).toFixed(0)}KB (-${pct}%)  ${relative(DIR, file)}`,
  );

  if (DRY) return;
  const tmp = `${file}.opt-tmp`;
  try {
    writeFileSync(tmp, out);
    renameSync(tmp, file);
  } catch (error) {
    try {
      unlinkSync(tmp);
    } catch {}
    stats.failed += 1;
    console.error("write failed:", file, error.message);
  }
}

async function main() {
  let files = walk(DIR).map((f) => ({ f, s: statSync(f).size }));
  if (ONLY) files = files.filter(({ f }) => f.includes(ONLY));
  files.sort((a, b) => b.s - a.s);
  if (files.length > LIMIT) files = files.slice(0, LIMIT);

  console.log(
    `Optimizing ${files.length} candidate(s) in ${DIR} (max=${MAX_DIM}px, min=${(MIN_BYTES / 1024) | 0}KB, q=${QUALITY}${DRY ? ", DRY RUN" : ""})`,
  );

  let cursor = 0;
  const worker = async () => {
    while (cursor < files.length) {
      const item = files[cursor++];
      await optimize(item.f);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(
    `\nDone. optimized=${stats.processed} skipped=${stats.skipped} failed=${stats.failed}`,
  );
  console.log(
    `bytes ${mb(stats.before)}MB -> ${mb(stats.after)}MB (saved ${mb(stats.saved)}MB)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
