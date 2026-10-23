import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.TOUR_BASE || "http://localhost:4000";
const out = process.env.TOUR_CAPTURE_OUT || path.resolve("captures/a2");
const email = process.env.TOUR_EMAIL;
const password = process.env.TOUR_PASSWORD;
if (!email || !password) {
  throw new Error("Set TOUR_EMAIL and TOUR_PASSWORD to a demo customer account.");
}
fs.mkdirSync(out, { recursive: true });
const CSS = `
  nextjs-portal{display:none!important}
  html{scroll-behavior:auto!important;scrollbar-width:none!important}
  ::-webkit-scrollbar{display:none!important}
  *{caret-color:transparent!important}
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(`${base}/account/login`, { waitUntil: "load" });
await page.locator("#login-email").fill(email);
await page.locator("#login-password").fill(password);
await page.getByRole("button", { name: /^sign in$/i }).click();
await page.waitForURL((u) => u.pathname === "/account", { timeout: 25000 });

await page.goto(`${base}/cart`, { waitUntil: "load" });
for (let i = 0; i < 10; i++) {
  const rm = page.getByRole("button", { name: /^Remove .* from cart$/i }).first();
  if (!(await rm.count())) break;
  await rm.click();
  await page.waitForTimeout(800);
}
await page.goto(`${base}/product/male-dc-to-split-dc-cable`, { waitUntil: "load" });
await page.getByRole("button", { name: /add to cart/i }).first().click();
await page.waitForTimeout(1200);

await page.goto(`${base}/checkout`, { waitUntil: "load" });
await page.addStyleTag({ content: CSS });

const postcode = page.locator('input[name="postcode"], #postcode').first();
if (await postcode.count()) {
  const v = await postcode.inputValue();
  if (!v) {
    await postcode.fill(process.env.TOUR_POSTCODE || "560038");
    await postcode.blur();
  }
}

for (let i = 0; i < 40; i++) {
  const ready = await page.evaluate(() =>
    [...document.querySelectorAll("button")].some((b) => /place order/i.test(b.textContent || "") && !b.disabled)
  );
  if (ready) break;
  await page.waitForTimeout(500);
}
await page.waitForTimeout(1200);

await page.getByRole("radio", { name: /pay online/i }).check();
await page.waitForTimeout(1500);

// frame the shot like the existing payment asset: heading sits at CSS y=171
const heading = page.getByText("Payment method", { exact: true }).first();
const abs = await heading.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
await page.evaluate((y) => window.scrollTo({ top: y - 171, behavior: "instant" }), abs);
await page.waitForTimeout(700);

await page.screenshot({ path: `${out}/payment2.png` });
console.log("ok");
await browser.close();
