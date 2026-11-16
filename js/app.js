// App shell: hash router, top bar, tab bar and service worker updates.

import { homeView } from './views/home.js';
import { levelView } from './views/level.js';
import { lessonView } from './views/lesson.js';
import { coachView } from './views/coach.js';
import { problemsView } from './views/problems.js';
import { moreView } from './views/more.js';

const routes = [
  { re: /^\/?$/, view: homeView, tab: 'path' },
  { re: /^\/stufe\/(?<id>\d+)$/, view: levelView, tab: 'path' },
  { re: /^\/lektion\/(?<id>[\d.]+)$/, view: lessonView, tab: 'path' },
  { re: /^\/coach$/, view: coachView, tab: 'coach' },
  { re: /^\/probleme$/, view: problemsView, tab: 'problems' },
  { re: /^\/mehr$/, view: moreView, tab: 'more' },
];

const app = document.getElementById('app');
const titleEl = document.getElementById('title');
const backEl = document.getElementById('back');
let current = null;
let lastPath = null;

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

  app.innerHTML = v.html;
  titleEl.textContent = v.title;
  document.title = v.title === 'Pistencoach' ? 'Pistencoach' : `${v.title} · Pistencoach`;
  backEl.hidden = !v.back;
  if (v.back) backEl.href = v.back;
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === route.tab));
  if (v.mount) v.mount(app, render);
  if (path !== lastPath) window.scrollTo(0, 0);
  lastPath = path;
}

window.addEventListener('hashchange', render);
render();

// Service worker: offline cache and update hint
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const offer = (worker) => {
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
  });
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  });
}
