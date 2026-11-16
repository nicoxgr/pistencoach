// App shell: hash router with directional transitions, top bar, tab bar and
// service worker updates.

import { homeView } from './views/home.js';
import { levelView } from './views/level.js';
import { lessonView } from './views/lesson.js';
import { coachView } from './views/coach.js';
import { problemsView } from './views/problems.js';
import { moreView, applyTheme } from './views/more.js';
import { glossaryView, placementView } from './views/extras.js';
import { pisteView } from './views/piste.js';
import { historyView } from './views/history.js';
import { stagger, countUp, accordions } from './ui/motion.js';

const TABS = ['path', 'coach', 'problems', 'more'];
const routes = [
  { re: /^\/?$/, view: homeView, tab: 'path', depth: 0 },
  { re: /^\/stufe\/(?<id>\d+)$/, view: levelView, tab: 'path', depth: 1 },
  { re: /^\/lektion\/(?<id>[\d.]+)$/, view: lessonView, tab: 'path', depth: 2 },
  { re: /^\/einstufung$/, view: placementView, tab: 'path', depth: 1 },
  { re: /^\/coach$/, view: coachView, tab: 'coach', depth: 0 },
  { re: /^\/verlauf$/, view: historyView, tab: 'coach', depth: 1 },
  { re: /^\/piste(?:\/(?<id>[\d.]+))?$/, view: pisteView, tab: 'coach', depth: 3 },
  { re: /^\/probleme$/, view: problemsView, tab: 'problems', depth: 0 },
  { re: /^\/mehr$/, view: moreView, tab: 'more', depth: 0 },
  { re: /^\/glossar$/, view: glossaryView, tab: 'more', depth: 1 },
];

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');
const titleEl = document.getElementById('title');
const backEl = document.getElementById('back');
const tabbar = document.querySelector('.tabbar');
const scrollPos = new Map();
let current = null;
let lastPath = null;
let lastDepth = 0;

applyTheme();

// iOS text size setting: follow it, but cap it so the layout stays intact.
const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
if (rootSize > 22) document.documentElement.style.fontSize = '22px';

function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  let match = null;
  let route = null;
  for (const r of routes) {
    match = path.match(r.re);
    if (match) {
      route = r;
      break;
    }
  }
  const v = route ? route.view(match.groups || {}) : null;
  if (!v) {
    location.replace('#/');
    return;
  }
  if (current && current.destroy) current.destroy();
  current = v;

  const samePage = path === lastPath;
  if (lastPath && !samePage) scrollPos.set(lastPath, window.scrollY);
  const dir = samePage ? 'none' : route.depth > lastDepth ? 'forward' : route.depth < lastDepth ? 'back' : 'fade';

  app.classList.remove('ready');
  app.dataset.dir = dir;
  app.innerHTML = v.html;
  stagger(app);

  titleEl.textContent = v.title;
  document.title = v.title === 'Pistencoach' ? 'Pistencoach' : `${v.title} · Pistencoach`;
  topbar.hidden = !v.back;
  if (v.back) backEl.href = v.back;
  document.querySelectorAll('.tabbar a').forEach((a) => {
    const on = a.dataset.tab === route.tab;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  tabbar.style.setProperty('--tab', TABS.indexOf(route.tab));

  if (v.mount) v.mount(app, render);
  if (!v.ownAccordions) accordions(app);

  if (!samePage) window.scrollTo(0, dir === 'back' ? scrollPos.get(path) || 0 : 0);
  // Screen readers and keyboards continue at the top of the new page.
  if (!samePage && lastPath !== null) app.focus({ preventScroll: true });
  lastPath = path;
  lastDepth = route.depth;

  // Two frames later the progress rings and bars run to their values.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      app.classList.add('ready');
      countUp(app);
    }),
  );
}

window.addEventListener('hashchange', render);
render();

// Service worker: offline cache and update hint. Skipped on localhost so
// local changes show up without clearing the cache.
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !local) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    const offer = (worker) => {
      // Right after launch the new version takes over silently. Later it asks,
      // so a reload never interrupts someone in the middle of a lesson.
      if (performance.now() < 5000) {
        worker.postMessage('skipWaiting');
        return;
      }
      const toast = document.getElementById('toast');
      toast.hidden = false;
      toast.querySelector('button').onclick = () => worker.postMessage('skipWaiting');
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
    // An installed app on iOS is resumed, not reloaded, so it would never look
    // for updates on its own. Check whenever it comes back to the foreground.
    let lastCheck = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 60000) return;
      lastCheck = Date.now();
      reg.update().catch(() => {});
    });
  });
  // Reload when a new version takes over, but not on the very first visit,
  // where the worker only starts to control a page that is already current.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || !hadController) return;
    reloaded = true;
    location.reload();
  });
}
