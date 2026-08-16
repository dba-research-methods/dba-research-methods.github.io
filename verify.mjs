/* Browser regression pass. Static checks live in check.py.
   Needs playwright-core and a chromium build:
     PLAYWRIGHT=/path/to/playwright-core/index.mjs \
     CHROME_PATH=/path/to/chrome \
     node verify.mjs
   Serve the site first: python3 -m http.server 8099 */
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

const BASE = process.env.BASE || 'http://localhost:8099';
const PAGES = ['index.html', 'research-desk.html', 'rq-lab.html', 'smart-critique.html', 'ml-fundamentals.html', 'audio-orientation.html'];

const fails = [];
const note = (m) => { fails.push(m); console.log('FAIL ' + m); };
const ok = (m) => console.log('  ok  ' + m);

const browser = await chromium.launch({ channel: undefined, executablePath: process.env.CHROME_PATH });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const p of PAGES) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle' });
  console.log('\n== ' + p);

  if (errors.length) note(`${p}: console errors -> ${errors.slice(0, 3).join(' | ')}`);
  else ok('no console errors');

  // site strip present + current page marked
  const strip = await page.locator('.site-strip-nav a').count();
  const current = await page.locator('.site-strip [aria-current="page"], .site-strip-mark[aria-current="page"]').count();
  if (strip !== 5) note(`${p}: site strip has ${strip} links, expected 5`);
  else ok('site strip: 5 cross-page links');
  if (current < 1) note(`${p}: site strip does not mark the current page`);
  else ok('current page marked');

  // search: ctrl+K opens and returns results
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(200);
  const open = await page.locator('[data-search-dialog].open').count();
  if (!open) { note(`${p}: Ctrl+K did not open search`); }
  else {
    await page.fill('[data-search-input]', 'research');
    await page.waitForTimeout(200);
    const n = await page.locator('.search-result-link').count();
    const cross = await page.locator('.search-result-link[href$=".html"]').count();
    if (n === 0) note(`${p}: search returned 0 results for "research"`);
    else ok(`search: ${n} results (${cross} cross-page)`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // dark mode + theme-color sync
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(150);
  const dark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const tc = await page.getAttribute('meta[name="theme-color"]', 'content');
  if (!dark || tc !== '#0A0D14') note(`${p}: dark toggle broken (dark=${dark}, theme-color=${tc})`);
  else ok('dark mode + theme-color sync');
  await page.click('[data-theme-toggle]');

  // mobile dialog
  await page.setViewportSize({ width: 390, height: 800 });
  await page.click('[data-navigation-trigger]');
  await page.waitForTimeout(300);
  const dlgOpen = await page.locator('[data-nav-dialog].open').count();
  const pagesGroup = await page.locator('[data-nav-dialog] nav[aria-label="Site pages"] a').count();
  if (!dlgOpen) note(`${p}: mobile dialog did not open`);
  else if (pagesGroup < 6) note(`${p}: mobile dialog Pages group has ${pagesGroup} links, expected 6`);
  else ok(`mobile dialog: open, ${pagesGroup} page links`);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.close();
}

// ---- desk-specific behaviour
console.log('\n== research-desk behaviour');
{
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/research-desk.html`, { waitUntil: 'networkidle' });

  for (const tab of ['books', 'tools', 'jargon', 'vault', 'solver']) {
    await page.click(`#tab-${tab}`);
    await page.waitForTimeout(120);
    const visible = await page.locator(`#pane-${tab}`).isVisible();
    const others = await page.locator('.desk-pane:visible').count();
    if (!visible || others !== 1) note(`desk: tab ${tab} -> visible=${visible}, panes visible=${others}`);
  }
  ok('tab switching shows exactly one pane');

  // deep link — must be a fresh document; goto to a different hash on the same
  // URL is a fragment navigation and would not re-run desk.js
  {
    const fresh = await ctx.newPage();
    await fresh.goto(`${BASE}/research-desk.html#pane-tools`, { waitUntil: 'networkidle' });
    if (!(await fresh.locator('#pane-tools').isVisible())) note('desk: #pane-tools deep link did not open the tab');
    else ok('deep link #pane-tools');
    await fresh.close();
  }

  // diagnostic wizard
  await page.goto(`${BASE}/research-desk.html`, { waitUntil: 'networkidle' });
  await page.selectOption('#wiz-setting', 'comparative');
  await page.selectOption('#wiz-objective', 'compare');
  await page.waitForTimeout(100);
  const result = await page.textContent('#wiz-result-name');
  if (!/fsQCA/.test(result)) note(`desk: diagnostic gave "${result}", expected the fsQCA match`);
  else ok(`diagnostic: ${result}`);
  await page.click('#wiz-btn-jump');
  await page.waitForTimeout(400);
  const hl = await page.locator('.ref-card.highlight-match').count();
  const toast = await page.locator('#toast.show').count();
  if (hl !== 1 || !toast) note(`desk: jump highlighted ${hl} cards, toast=${toast}`);
  else ok('jump-to-match highlights one card + toast');

  // filter
  await page.fill('#global-search-input', 'taguette');
  await page.waitForTimeout(200);
  const count = await page.textContent('#search-match-count');
  const shown = await page.locator('#pane-solver .ref-card:visible').count();
  ok(`filter "taguette": ${count.trim()} (solver pane showing ${shown})`);
  if (!/matching reference/.test(count)) note('desk: filter did not update the count');

  if (errors.length) note('desk: pageerror -> ' + errors.join(' | '));
  await page.close();
}

// ---- audio page behaviour
console.log('\n== audio-orientation behaviour');
{
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/audio-orientation.html`, { waitUntil: 'networkidle' });

  const lines = await page.locator('#transcript-list li').count();
  if (lines !== 8) note(`audio: transcript has ${lines} lines, expected 8`);
  else ok('full transcript rendered (8 lines)');

  await page.click('.chapter-btn[data-seek="26"]');
  await page.waitForTimeout(400);
  const scene = await page.locator('#scene-3.active').count();
  if (!scene) note('audio: chapter 3 did not activate scene-3');
  else ok('chapter jump activates the right scene');

  const painted = await page.evaluate(() => {
    const c = document.getElementById('waveform');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  if (!painted) note('audio: waveform canvas painted nothing');
  else ok('waveform canvas paints');

  if (errors.length) note('audio: pageerror -> ' + errors.join(' | '));
  await page.close();
}

await browser.close();
console.log(`\n${fails.length} failure(s)`);
process.exit(fails.length ? 1 : 0);
