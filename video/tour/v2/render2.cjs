const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { once } = require("events");

const mode = process.argv[2] || "preview";
const which = process.argv[3] || "marketing";
const ROOT = __dirname;
const PAGE = `file://${path.join(ROOT, `${which}.html`)}`;
const OUT = path.join(ROOT, "prev");

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("PAGEERROR:", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("CONSOLE:", m.text()); });
  await page.goto(PAGE, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  return page;
}

(async () => {
  const browser = await chromium.launch({
    args: ["--force-color-profile=srgb", "--font-render-hinting=none", "--disable-lcd-text"],
  });

  if (mode === "preview") {
    fs.mkdirSync(OUT, { recursive: true });
    const times = (process.argv[4] || "2,8,16,24,32,40,48,56,64,72,80,88,96,104,112,120,128,136,144")
      .split(",").map(Number);
    const page = await openPage(browser);
    const total = await page.evaluate(() => window.__TIMING.total);
    for (const t of times) {
      if (t > total - 0.2) continue;
      const i = Math.round(t * 30);
      await page.evaluate((n) => window.__render(n), i);
      await page.screenshot({ path: `${OUT}/${which}-${String(i).padStart(5, "0")}.png`, animations: "disabled" });
    }
    console.log("preview ok", which, "total", total);
    await browser.close();
    return;
  }

  // full render -> stream frames in order into ffmpeg
  const workers = Number(process.argv[4] || 3);
  const audio = process.argv[5];
  const outFile = process.argv[6];
  const WIN = 90;

  const page0 = await openPage(browser);
  const total = await page0.evaluate(() => window.__frames);
  await page0.close();

  const ff = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "warning", "-y",
    "-f", "image2pipe", "-framerate", "30", "-i", "-",
    "-i", audio,
    "-vf", "noise=alls=5:allf=t+u,vignette=PI/4.8,format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-profile:v", "high", "-level", "4.1",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
    "-movflags", "+faststart", "-shortest", outFile,
  ], { stdio: ["pipe", "inherit", "inherit"] });

  let assign = 0;
  const buffers = new Map();
  let write = 0;
  let waiters = [];
  const notify = () => { const w = waiters; waiters = []; w.forEach((r) => r()); };
  const waitFor = async (pred) => { while (!pred()) await new Promise((r) => waiters.push(r)); };

  const pages = await Promise.all(Array.from({ length: workers }, () => openPage(browser)));
  const started = Date.now();
  let done = 0;

  // Chromium occasionally stalls on a composited frame; retry after a reload
  // instead of aborting the whole render.
  async function grab(page, i) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await page.evaluate((n) => window.__render(n), i);
        return await page.screenshot({
          type: "jpeg", quality: 96, animations: "disabled", timeout: 90000,
        });
      } catch (err) {
        console.log(`retry frame ${i} attempt ${attempt + 1}: ${String(err.message).split("\n")[0]}`);
        if (attempt === 3) throw err;
        await page.reload({ waitUntil: "load", timeout: 90000 });
        await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
      }
    }
  }

  const renderWorker = async (page) => {
    while (true) {
      await waitFor(() => assign >= total || assign - write < WIN);
      if (assign >= total) return;
      const i = assign++;
      notify();
      const buf = await grab(page, i);
      buffers.set(i, buf);
      done++;
      if (done % 120 === 0) {
        const el = (Date.now() - started) / 1000;
        console.log(`${done}/${total} · ${el.toFixed(0)}s · ${(done / el).toFixed(1)} fps`);
      }
      notify();
    }
  };

  const flusher = (async () => {
    while (write < total) {
      await waitFor(() => buffers.has(write));
      const buf = buffers.get(write);
      buffers.delete(write);
      write++;
      notify();
      if (!ff.stdin.write(buf)) await once(ff.stdin, "drain");
    }
    ff.stdin.end();
  })();

  await Promise.all([...pages.map(renderWorker), flusher]);
  await once(ff, "close");
  console.log(`done ${which} in ${((Date.now() - started) / 1000).toFixed(1)}s -> ${outFile}`);
  await browser.close();
})();
