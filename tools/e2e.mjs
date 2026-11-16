// End-to-end test in real browsers. Run with `node tools/e2e.mjs`.
// Needs Playwright (`npm install`, then `npx playwright install webkit`).
// WebKit is the engine closest to Safari on the iPhone; Chrome is the second run.
//
// The script serves the project itself, walks every screen, uses every control
// and reports console errors, layout problems and broken behaviour.
// Options: --shots=<dir> saves screenshots, --only=webkit|chrome limits the run.

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';
import { existsSync } from 'node:fs';
import { chromium, webkit, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const SHOTS = args.shots || null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };

// Static server. `bump` pretends a new release was deployed (for the update test).
const state = { bump: false };
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) throw new Error('outside root');
    let body = await readFile(file);
    if (state.bump && (path === '/sw.js' || path === '/js/version.js')) body = Buffer.from(body.toString().replace(/(\d+\.\d+\.)(\d+)/, (m, a, b) => `${a}${Number(b) + 100}`));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'max-age=600' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;
const BASE = `http://localhost:${PORT}/`;

const results = [];
let current = '';
const ok = (name, cond, detail = '') => {
  results.push({ browser: current, name, pass: !!cond, detail: cond ? '' : String(detail) });
  if (!cond) console.log(`  FAIL [${current}] ${name}${detail ? `: ${detail}` : ''}`);
};

const LESSONS = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '3.4', '4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3', '6.1', '6.2', '7.1', '7.2', '7.3'];
const ROUTES = ['/', '/coach', '/probleme', '/mehr', '/glossar', '/einstufung', '/verlauf', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `/stufe/${n}`)];

// Layout and accessibility audit, evaluated inside the page.
const AUDIT = () => {
  const issues = [];
  const vw = window.innerWidth;
  const visible = (n) => {
    const r = n.getBoundingClientRect();
    const st = getComputedStyle(n);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && !n.closest('[hidden]');
  };
  const label = (n) => `${n.tagName.toLowerCase()}${n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : ''} "${(n.textContent || '').trim().slice(0, 30)}"`;
  if (document.documentElement.scrollWidth > vw + 1) issues.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`);
  for (const n of document.querySelectorAll('a[href], button, summary, input:not([hidden]), textarea, [role="button"]')) {
    if (!visible(n) || n.closest('.chips') || n.disabled || n.classList.contains('term-link')) continue; // term links are words in running text
    const r = n.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) issues.push(`off screen: ${label(n)}`);
    if (r.width < 40 || r.height < 40) issues.push(`touch target ${Math.round(r.width)}x${Math.round(r.height)}: ${label(n)}`);
    const name = (n.getAttribute('aria-label') || n.textContent || n.getAttribute('placeholder') || '').trim();
    const labelled = name || (n.id && document.querySelector(`label[for="${n.id}"]`)) || n.closest('label');
    if (!labelled) issues.push(`no accessible name: ${label(n)}`);
  }
  for (const n of document.querySelectorAll('.btn, .seg button, .chip, .piste-btn, .fact, .cue, .tag')) {
    if (visible(n) && n.scrollWidth > n.clientWidth + 1) issues.push(`text cut off: ${label(n)}`);
  }
  for (const n of document.querySelectorAll('svg[role="img"], [role="img"]')) {
    if (visible(n) && !n.getAttribute('aria-label')) issues.push(`image without label: ${label(n)}`);
  }
  for (const n of document.querySelectorAll('#app h2, #app h3, #app p, #app li, #app .card')) {
    if (!visible(n)) continue;
    const r = n.getBoundingClientRect();
    if (r.right > vw + 1) issues.push(`content wider than screen: ${label(n)}`);
  }
  return [...new Set(issues)];
};

// Wait for the page to come to rest: a short pause, then every entrance
// animation (endless ones like snow are ignored).
async function settle(page, ms = 250) {
  await page.waitForTimeout(ms);
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => {})),
      ),
      new Promise((r) => setTimeout(r, 2500)),
    ]),
  );
  await page.waitForTimeout(80);
}

async function go(page, route) {
  await page.evaluate((r) => (location.hash = `#${r}`), route);
  await settle(page);
}

async function audit(page, where) {
  const issues = await page.evaluate(AUDIT);
  ok(`layout ${where}`, issues.length === 0, issues.join(' | '));
}

async function shot(page, name) {
  if (!SHOTS) return;
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `${current}-${name}.png`) });
}

function watch(page, bucket) {
  page.on('pageerror', (e) => bucket.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && bucket.push(`console: ${m.text()}`));
}

async function open(browser, opts = {}, init = null) {
  const context = await browser.newContext({ locale: 'de-DE', ...opts });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errors = [];
  watch(page, errors);
  await page.goto(BASE);
  await settle(page, 900);
  return { context, page, errors };
}

async function suite(browser, device) {
  // ---- 1. Every screen renders, fits and has no errors ----
  {
    const { context, page, errors } = await open(browser, device);
    ok('home shows the brand', (await page.locator('h1.brand').textContent()).includes('Pistencoach'));
    ok('home shows 7 levels', (await page.locator('.trail-item').count()) === 7);
    ok('first start offers the placement', await page.locator('[data-onb]').isVisible());
    await shot(page, 'home');
    for (const r of ROUTES) {
      await go(page, r);
      await audit(page, r);
    }
    await go(page, '/nichts');
    ok('unknown route falls back to home', (await page.evaluate(() => location.hash)) === '#/');
    ok('no errors on the main screens', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 2. Every lesson: content, player, views, mistake variant ----
  {
    const { context, page, errors } = await open(browser, device);
    for (const id of LESSONS) {
      await go(page, `/lektion/${id}`);
      const where = `lesson ${id}`;
      ok(`${where} has a player`, (await page.locator('.player .stage svg.scene').count()) === 1);
      ok(`${where} has 5 sections`, (await page.locator('details.acc').count()) === 5);
      await audit(page, where);
      const views = page.locator('.player .seg').first().locator('button');
      const n = await views.count();
      for (let i = 0; i < n; i++) {
        if (n > 1) await views.nth(i).click(); // a single view has no switcher
        await page.waitForTimeout(150);
        const lab = await page.locator('.stage svg.scene').getAttribute('aria-label');
        ok(`${where} view ${i} draws`, !!lab && (await page.locator('.stage svg.scene *').count()) > 10, lab);
      }
      // the animation really moves (it pauses while scrolled out of view)
      await page.locator('.stage').scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      const a = await page.locator('.scrub').inputValue();
      await page.waitForTimeout(450);
      const b = await page.locator('.scrub').inputValue();
      ok(`${where} animation runs`, a !== b, `${a} -> ${b}`);
      await page.locator('.seg-variant .bad').click();
      await page.waitForTimeout(200);
      ok(`${where} mistake shows its note`, await page.locator('.variant-note').isVisible());
      ok(`${where} mistake hides the steps`, await page.locator('.steps').isHidden());
      ok(`${where} mistake names itself`, (await page.locator('.step-chip').textContent()).length > 3);
      await page.locator('.seg-variant .good').click();
      await page.waitForTimeout(150);
      ok(`${where} steps return`, await page.locator('.steps').isVisible());
    }
    ok('no errors in any lesson', errors.length === 0, [...new Set(errors)].join(' | '));
    await context.close();
  }

  // ---- 3. Player controls and full screen ----
  {
    const { context, page, errors } = await open(browser, device);
    await go(page, '/lektion/3.2');
    await page.locator('.controls .play').click();
    const p1 = await page.locator('.scrub').inputValue();
    await page.waitForTimeout(400);
    ok('pause stops the animation', p1 === (await page.locator('.scrub').inputValue()));
    ok('paused stage offers a play button', await page.locator('.stage-play').isVisible());
    await page.locator('.steps li').nth(2).click();
    await page.waitForTimeout(200);
    ok('a step jumps to its phase', (await page.locator('.steps li.active b').textContent()) === 'Steuern');
    const sp = page.locator('.controls .speed');
    const s0 = await sp.textContent();
    await sp.click();
    ok('speed button cycles', (await sp.textContent()) !== s0);
    const before = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.locator('.controls .play').click();
    await page.waitForTimeout(1600);
    ok('page height stays stable while playing', before === (await page.evaluate(() => document.documentElement.scrollHeight)));
    await page.locator('.controls .full').click();
    await page.waitForTimeout(300);
    const box = await page.locator('.player.full').boundingBox();
    const vp = page.viewportSize();
    ok('full screen fills the viewport', box && Math.abs(box.width - vp.width) < 2 && Math.abs(box.height - vp.height) < 2, JSON.stringify(box));
    const stage = await page.locator('.player.full .stage').boundingBox();
    ok('full screen stage is large', stage && stage.height > vp.height * 0.5, JSON.stringify(stage));
    ok('full screen keeps the controls on screen', await page.locator('.player.full .controls .play').isVisible());
    await audit(page, 'full screen portrait');
    await shot(page, 'player-full');
    await page.setViewportSize({ width: vp.height, height: vp.width });
    await page.waitForTimeout(300);
    const st2 = await page.locator('.player.full .stage').boundingBox();
    const ctl = await page.locator('.player.full .controls').boundingBox();
    ok('landscape puts stage and controls side by side', st2 && ctl && ctl.x >= st2.x + st2.width - 2 && st2.height > vp.width * 0.8, JSON.stringify({ st2, ctl }));
    await audit(page, 'full screen landscape');
    await shot(page, 'player-full-landscape');
    await page.setViewportSize(vp);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    ok('Escape leaves full screen', (await page.locator('.player.full').count()) === 0);
    await page.locator('.controls .full').click();
    await go(page, '/coach');
    ok('leaving the lesson unlocks scrolling', !(await page.evaluate(() => document.documentElement.classList.contains('player-full'))));
    ok('no errors in the player', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 4. Lesson: sections, self-check, status, note, persistence ----
  {
    const { context, page, errors } = await open(browser, device);
    await go(page, '/lektion/2.3');
    const why = page.locator('details[data-acc="why"]');
    ok('extra sections start closed', !(await why.evaluate((d) => d.open)));
    await why.locator('summary').click();
    await page.waitForTimeout(600);
    ok('a section opens on tap', (await why.evaluate((d) => d.open)) && (await why.locator('.acc-body').boundingBox()).height > 40);
    await why.locator('summary').click();
    await page.waitForTimeout(600);
    ok('a section closes on tap', !(await why.evaluate((d) => d.open)));
    const checks = page.locator('[data-check]');
    const n = await checks.count();
    ok('the all-done button starts hidden', await page.locator('[data-alldone]').isHidden());
    for (let i = 0; i < n; i++) await checks.nth(i).click();
    ok('ticking everything offers to finish', await page.locator('[data-alldone]').isVisible());
    await page.locator('[data-alldone]').click();
    await page.waitForTimeout(300);
    ok('finishing marks the lesson as done', (await page.locator('[data-st="done"]').getAttribute('aria-checked')) === 'true');
    ok('the change date appears', (await page.locator('[data-changed]').textContent()).includes('Zuletzt geändert'));
    await page.locator('#note').fill('Linkskurve klappt, rechts noch Pflug.');
    await page.locator('#note').blur();
    await page.reload();
    await settle(page, 900);
    ok('status survives a reload', (await page.locator('[data-st="done"]').getAttribute('aria-checked')) === 'true');
    ok('ticks survive a reload', (await page.locator('[data-check].on').count()) === n);
    ok('note survives a reload', (await page.locator('#note').inputValue()).includes('Linkskurve'));
    await page.locator('[data-st="done"]').focus();
    await page.keyboard.press('ArrowLeft');
    ok('arrow keys move the status', (await page.locator('[data-st="practicing"]').getAttribute('aria-checked')) === 'true');
    ok('back link leads to the level', (await page.locator('#back').getAttribute('href')) === '#/stufe/2');
    // glossary sheet
    await go(page, '/lektion/4.2');
    const link = page.locator('.term-link').first();
    const term = await link.getAttribute('data-term');
    await link.click();
    await page.waitForTimeout(450);
    ok('a term opens its explanation', (await page.locator('.sheet h3').textContent()) === term);
    await audit(page, 'glossary sheet');
    await shot(page, 'sheet');
    await page.locator('.sheet [data-close]').click();
    await page.waitForTimeout(400);
    ok('the sheet closes', (await page.locator('.sheet').count()) === 0);
    await link.click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    ok('Escape closes the sheet', (await page.locator('.sheet').count()) === 0);
    // level: mark all
    await go(page, '/stufe/1');
    await page.locator('[data-all]').click();
    await settle(page);
    ok('a level can be marked as done', (await page.locator('.st-done').count()) === 4 && (await page.locator('[data-all]').count()) === 0);
    await go(page, '/');
    ok('navigation moves focus to the page', await page.evaluate(() => document.activeElement === document.getElementById('app')));
    ok('no errors in the lesson flow', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 5. Placement, history, coach, problems, glossary ----
  {
    const { context, page, errors } = await open(browser, device);
    await page.locator('[data-onb] a.btn').click();
    await settle(page);
    ok('the apply button waits for a choice', await page.locator('[data-apply]').isDisabled());
    await page.locator('[data-opt]').nth(3).click();
    await page.locator('[data-apply]').click();
    await settle(page, 1200);
    ok('placement returns home', (await page.evaluate(() => location.hash)) === '#/');
    ok('placement completes three levels', (await page.locator('.trail-item.complete').count()) === 3);
    ok('placement moves the next step', (await page.locator('.hero .eyebrow').textContent()).includes('4.1'));
    ok('the placement hint is gone', (await page.locator('[data-onb]').count()) === 0);
    await go(page, '/lektion/4.1');
    await page.locator('[data-st="practicing"]').click();
    await go(page, '/verlauf');
    const hist = await page.locator('.hist').first().textContent();
    ok('history lists the placement', hist.includes('Einstufung'));
    ok('history lists the status change', hist.includes('4.1') && hist.includes('Übe ich'));
    ok('history counts one day', (await page.locator('.head-stats .stat b').first().textContent()) === '1');
    await shot(page, 'history');
    await go(page, '/coach');
    ok('coach picks the lesson in practice', (await page.locator('.piste-mode .eyebrow').textContent()).includes('4.1'));
    const tip = await page.locator('[data-tip]').textContent();
    await page.locator('[data-next-tip]').click();
    await page.waitForTimeout(600);
    ok('another tip appears', (await page.locator('[data-tip]').textContent()) !== tip);
    await shot(page, 'coach');
    await go(page, '/probleme');
    await page.locator('[data-cat="Tempo"]').click();
    await page.waitForTimeout(300);
    ok('problems filter by category', (await page.locator('.problem').count()) === 2);
    await page.locator('.problem summary').first().click();
    await page.waitForTimeout(600);
    await page.locator('.problem .link-row').first().click();
    await settle(page);
    ok('a problem leads to its lesson', (await page.evaluate(() => location.hash)).startsWith('#/lektion/'));
    await go(page, '/glossar');
    await page.locator('[data-q]').fill('Kante');
    await page.waitForTimeout(200);
    const hits = await page.locator('.term').count();
    ok('glossary search narrows the list', hits > 0 && hits < 22, hits);
    await page.locator('[data-q]').fill('xyzq');
    await page.waitForTimeout(200);
    ok('glossary search shows an empty state', await page.locator('[data-empty]').isVisible());
    ok('no errors in coach and tools', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 6. Slope mode ----
  {
    const { context, page, errors } = await open(browser, device);
    await go(page, '/piste/3.2');
    await audit(page, 'slope mode');
    await shot(page, 'piste');
    ok('slope mode covers the tab bar', await page.evaluate(() => !!document.elementFromPoint(innerWidth / 2, innerHeight - 30).closest('.piste')));
    ok('back is disabled on the first slide', await page.locator('[data-prev]').isDisabled());
    const big = await page.locator('.piste-text').evaluate((n) => parseFloat(getComputedStyle(n).fontSize));
    ok('cues are set very large', big >= 40, big);
    const btn = await page.locator('[data-next]').boundingBox();
    ok('buttons are glove sized', btn.height >= 80 && btn.width >= 200, JSON.stringify(btn));
    const total = Number((await page.locator('[data-count-label]').textContent()).split('/')[1]);
    for (let i = 1; i < total; i++) {
      await page.locator('[data-next]').click();
      await page.waitForTimeout(120);
      if (i === 3) await audit(page, 'slope mode drill');
    }
    ok('the last slide asks for the status', (await page.locator('[data-rate]').count()) === 3);
    await audit(page, 'slope mode rating');
    await shot(page, 'piste-rate');
    await page.locator('[data-prev]').click();
    await page.waitForTimeout(150);
    ok('back works', (await page.locator('[data-count-label]').textContent()).startsWith(`${total - 1}/`));
    await page.keyboard.press('ArrowRight');
    await page.locator('[data-rate="practicing"]').click();
    await settle(page, 900);
    ok('rating returns to the lesson', (await page.evaluate(() => location.hash)) === '#/lektion/3.2');
    ok('rating sets the status', (await page.locator('[data-st="practicing"]').getAttribute('aria-checked')) === 'true');
    ok('the tab bar is back', await page.evaluate(() => !!document.elementFromPoint(innerWidth / 2, innerHeight - 30).closest('.tabbar')));
    ok('no errors in slope mode', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 7. Appearance, backup, reset ----
  {
    const { context, page, errors } = await open(browser, { ...device, acceptDownloads: true });
    await go(page, '/lektion/1.1');
    await page.locator('[data-st="done"]').click();
    await go(page, '/mehr');
    await page.locator('[data-theme-id="dark"]').click();
    ok('dark can be forced', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('[data-theme-id="light"]').click();
    ok('light looks different from dark', darkBg !== (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)));
    await page.locator('[data-theme-id="dark"]').click();
    await page.reload();
    await settle(page, 900);
    ok('the appearance survives a reload', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
    await audit(page, 'more, dark');
    const dl = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.evaluate(() => (navigator.canShare = undefined));
    await page.locator('[data-export]').click();
    const download = await dl;
    ok('a backup file is offered', !!download);
    if (download) {
      const path = join(ROOT, 'test-results', `backup-${current}.json`);
      await mkdir(join(ROOT, 'test-results'), { recursive: true });
      await download.saveAs(path);
      const data = JSON.parse(await readFile(path, 'utf8'));
      ok('the backup holds the progress', data.lessons['1.1'].status === 'done' && Array.isArray(data.log) && data.log.length === 1);
      page.once('dialog', (d) => d.accept());
      await page.locator('[data-reset]').click();
      await page.waitForTimeout(300);
      await go(page, '/lektion/1.1');
      ok('reset clears the progress', (await page.locator('[data-st="open"]').getAttribute('aria-checked')) === 'true');
      ok('reset keeps the appearance', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
      await go(page, '/mehr');
      await page.locator('[data-import]').setInputFiles(path);
      await page.waitForTimeout(400);
      ok('loading a backup confirms', (await page.locator('[data-msg]').textContent()).includes('geladen'));
      await go(page, '/lektion/1.1');
      ok('the backup restores the progress', (await page.locator('[data-st="done"]').getAttribute('aria-checked')) === 'true');
      const bad = join(ROOT, 'test-results', 'bad.json');
      await writeFile(bad, '{"version":1,"lessons":[]}');
      await go(page, '/mehr');
      await page.locator('[data-import]').setInputFiles(bad);
      await page.waitForTimeout(300);
      ok('a wrong file is refused', (await page.locator('[data-msg]').textContent()).includes('keine gültige'));
    }
    ok('no errors in settings', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 8. Sizes, text size, dark, reduced motion ----
  const SPOTS = ['/', '/stufe/3', '/lektion/3.2', '/lektion/2.1', '/coach', '/probleme', '/mehr', '/verlauf', '/einstufung', '/glossar', '/piste/3.2'];
  for (const [name, opts, root] of [
    ['small phone 320', { ...device, viewport: { width: 320, height: 568 } }, null],
    ['landscape', { ...device, viewport: { width: 844, height: 390 } }, null],
    ['tablet', { ...device, viewport: { width: 820, height: 1180 } }, null],
    ['text 125 %', device, '20px'],
    ['text 138 %', device, '22px'],
    ['dark', { ...device, colorScheme: 'dark' }, null],
  ]) {
    const { context, page, errors } = await open(browser, opts, root ? `new MutationObserver((m, o) => { if (document.documentElement) { document.documentElement.style.fontSize = '${root}'; o.disconnect(); } }).observe(document, { childList: true });` : null);
    if (root) ok(`${name}: text size applies`, (await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)) === root);
    for (const r of SPOTS) {
      await go(page, r);
      await audit(page, `${name} ${r}`);
    }
    await go(page, '/lektion/3.2');
    await shot(page, name.replace(/\W+/g, '-'));
    ok(`no errors: ${name}`, errors.length === 0, errors.join(' | '));
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, { ...device, reducedMotion: 'reduce' });
    ok('reduced motion: content is visible at once', (await page.locator('.trail-item').first().evaluate((n) => getComputedStyle(n).opacity)) === '1');
    ok('reduced motion: no moving skier in the header', (await page.locator('animateMotion').count()) === 0);
    await go(page, '/lektion/3.2');
    const a = await page.locator('.scrub').inputValue();
    await page.waitForTimeout(400);
    ok('reduced motion: the animation waits for a tap', a === (await page.locator('.scrub').inputValue()));
    await page.locator('details[data-acc="why"] summary').click();
    ok('reduced motion: sections open instantly', await page.locator('details[data-acc="why"]').evaluate((d) => d.open));
    await page.locator('.term-link').first().click();
    ok('reduced motion: the sheet opens', await page.locator('.sheet').isVisible());
    ok('no errors with reduced motion', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // ---- 9. Broken or blocked storage ----
  {
    const { context, page, errors } = await open(browser, device, `Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); };`);
    ok('blocked storage: the app starts', (await page.locator('.trail-item').count()) === 7);
    await go(page, '/lektion/1.1');
    await page.locator('[data-st="done"]').click();
    await go(page, '/');
    ok('blocked storage: progress lives in memory', (await page.locator('.trail-count b').first().textContent()) === '1');
    ok('no errors with blocked storage', errors.length === 0, errors.join(' | '));
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, device, `try { if (!sessionStorage.seeded) { localStorage.setItem('pistencoach', '{kaputt'); sessionStorage.seeded = 1; } } catch {}`);
    ok('corrupt storage: the app starts clean', (await page.locator('.trail-item').count()) === 7 && (await page.locator('.trail-item.complete').count()) === 0);
    ok('no errors with corrupt storage', errors.length === 0, errors.join(' | '));
    await context.close();
  }
  {
    // data written by version 0.2/0.3: no log, no theme, no checks
    const old = JSON.stringify({ version: 1, lessons: { '1.1': { status: 'done', updatedAt: '2026-11-16T10:00:00.000Z' }, '1.2': { status: 'practicing', note: 'alt' } }, onboardingDone: false });
    const { context, page, errors } = await open(browser, device, `try { if (!sessionStorage.seeded) { localStorage.setItem('pistencoach', ${JSON.stringify(old)}); sessionStorage.seeded = 1; } } catch {}`);
    ok('old data: progress is kept', (await page.locator('.trail-count b').first().textContent()) === '1');
    await go(page, '/verlauf');
    ok('old data: empty history shows a hint', await page.locator('.empty').isVisible());
    await go(page, '/lektion/1.2');
    ok('old data: the note is kept', (await page.locator('#note').inputValue()) === 'alt');
    ok('no errors with old data', errors.length === 0, errors.join(' | '));
    await context.close();
  }
}

// ---- 10. Offline and update (service worker), on a host that registers it ----
async function swSuite(browser, device) {
  const context = await browser.newContext({ locale: 'de-DE', ...device });
  const page = await context.newPage();
  const errors = [];
  watch(page, errors);
  // A host name the app does not treat as local, so the worker registers.
  let url = `http://app.localhost:${PORT}/`;
  try {
    await page.goto(url).catch(async () => {
      url = `http://[::1]:${PORT}/`;
      await page.goto(url);
    });
    const active = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 8000))]);
      return !!reg;
    });
    if (!active) {
      ok('service worker: registers (skipped, not available in this browser)', true);
      return;
    }
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys();
      const c = await caches.open(keys[0]);
      return { keys, n: (await c.keys()).length };
    });
    ok('service worker caches the app', cached.keys.length === 1 && cached.n >= 38, JSON.stringify(cached));
    await page.waitForTimeout(1200);
    ok('first visit does not reload itself', (await page.evaluate(() => performance.getEntriesByType('navigation')[0].type)) === 'navigate');
    await page.goto(url);
    await settle(page, 900);
    await context.setOffline(true);
    await page.goto(url);
    await settle(page, 900);
    ok('offline: home loads', (await page.locator('.trail-item').count()) === 7);
    await go(page, '/lektion/5.2');
    ok('offline: a lesson with animation loads', (await page.locator('.stage svg.scene').count()) === 1);
    await go(page, '/piste/5.2');
    ok('offline: slope mode loads', (await page.locator('.piste').count()) === 1);
    await context.setOffline(false);
    // a new release appears on the server
    const v0 = await page.evaluate(() => caches.keys());
    state.bump = true;
    await page.goto(url);
    await settle(page, 600);
    // Coming back to the foreground asks the server for a new version.
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r && r.update())).catch(() => {});
    const changed = () => page.evaluate((old) => caches.keys().then((k) => k.length === 1 && k[0] !== old), v0[0]).catch(() => false);
    let path = 'silent';
    for (let i = 0; i < 60 && !(await changed()); i++) {
      // Later than a few seconds after launch the app asks before it reloads.
      const toast = page.locator('#toast button');
      if (await toast.isVisible().catch(() => false)) {
        path = 'hint';
        await toast.click().catch(() => {});
      }
      await page.waitForTimeout(500);
    }
    await settle(page, 1500);
    console.log(`  update arrived via: ${path}`);
    const v1 = await page.evaluate(() => caches.keys());
    ok('update: the new version replaces the old cache', v1.length === 1 && v1[0] !== v0[0], `${v0} -> ${v1}`);
    await go(page, '/mehr');
    const shown = await page.locator('.fineprint.left').textContent();
    ok('update: the app runs the new version', v1[0].endsWith(shown.replace('Version ', '').trim()), `${shown} vs ${v1[0]}`);
    ok('no errors offline and during the update', errors.length === 0, errors.join(' | '));
  } catch (e) {
    // Playwright's WebKit build cannot drive every service worker navigation.
    const msg = e.message.split('\n')[0];
    if (current === 'webkit' && /policy check|not supported/i.test(msg)) console.log(`  note: service worker test stopped in WebKit (${msg})`);
    else ok('service worker test completes', false, msg);
  } finally {
    state.bump = false;
    await context.close();
  }
}

// Chrome installed under a non-standard name on this Mac; fall back to the regular channel.
const CHROME = process.env.CHROME_PATH || '/Applications/Chrome.app/Contents/MacOS/Google Chrome';
const iphone = devices['iPhone 14'];
const runs = [
  ['webkit', () => webkit.launch(), iphone],
  ['chrome', () => chromium.launch(existsSync(CHROME) ? { executablePath: CHROME } : { channel: 'chrome' }), { viewport: iphone.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices['Pixel 7'].userAgent }],
].filter(([name]) => !args.only || args.only === name);

for (const [name, launch, device] of runs) {
  current = name;
  console.log(`\n${name}`);
  let browser;
  try {
    browser = await launch();
  } catch (e) {
    console.log(`  could not start ${name}: ${e.message.split('\n')[0]}`);
    results.push({ browser: name, name: 'browser starts', pass: false, detail: e.message.split('\n')[0] });
    continue;
  }
  try {
    await suite(browser, device);
    await swSuite(browser, device);
  } catch (e) {
    ok('test run completes', false, e.stack.split('\n').slice(0, 3).join(' '));
  }
  await browser.close();
  const mine = results.filter((r) => r.browser === name);
  console.log(`  ${mine.filter((r) => r.pass).length} of ${mine.length} checks passed`);
}

server.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
