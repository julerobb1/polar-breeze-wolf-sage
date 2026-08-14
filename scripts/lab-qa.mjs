import { chromium } from "playwright";

const url = process.argv[2] ?? "http://127.0.0.1:8080/";
const out = process.argv[3] ?? "/workspace/screenshots/lab-booted.png";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const intro = page.getByRole("button", { name: /press power/i });
if (await intro.count()) {
  await intro.click();
} else {
  const power = page.getByRole("button", { name: /^power$/i }).first();
  if (await power.count()) await power.click();
}

await page.waitForTimeout(6500);

const body = await page.locator("body").innerText();
const probe = await page.evaluate(() => {
  const g = window;
  if (typeof g.__hv !== "function") return { nohv: true };
  const s = g.__hv().snapshot();
  return {
    stage: s.stage,
    frames: s.frames,
    insn: s.insnCount,
    painted: Array.isArray(s.fb) && s.fb.some((l) => l.trim().length > 0),
    fb0: s.fb?.[0],
  };
});

await page.screenshot({ path: out, fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
await page.screenshot({
  path: "/workspace/screenshots/lab-mobile.png",
  fullPage: true,
});

const overflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));

console.log(
  JSON.stringify(
    {
      hasTv: /the tv is on|model set-top|standby|lab feed/i.test(body),
      headline: body.match(/The TV is on|Starting the box|The box is off|Model set-top/)?.[0],
      probe,
      overflow,
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
