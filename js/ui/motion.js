// Small motion helpers: staggered reveals, count-up numbers, animated
// accordions, sliding segmented controls and a celebration burst.
// Everything degrades to an instant change with prefers-reduced-motion.

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Give children an index so CSS can stagger their entrance.
export function stagger(root) {
  [root, ...root.querySelectorAll('.stagger')].forEach((box) => {
    [...box.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 14)));
  });
}

// Count numbers up to their data-count value.
export function countUp(root) {
  root.querySelectorAll('[data-count]').forEach((n) => {
    const to = Number(n.dataset.count);
    if (reduced() || !to) {
      n.textContent = to;
      return;
    }
    const t0 = performance.now();
    const dur = 900;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1 && n.isConnected) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// <details class="acc"> with an animated body (.acc-body).
export function accordions(root) {
  root.querySelectorAll('details.acc').forEach((d) => {
    const summary = d.querySelector(':scope > summary');
    const body = d.querySelector(':scope > .acc-body');
    let anim = null;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (reduced()) {
        d.open = !d.open;
        return;
      }
      if (anim) anim.cancel();
      const opening = !d.open || d.classList.contains('closing');
      d.classList.remove('closing');
      if (opening) {
        d.open = true;
        const h = body.scrollHeight;
        anim = body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: Math.min(420, 180 + h * 0.5), easing: 'cubic-bezier(.2,.8,.2,1)' });
        anim.onfinish = () => (anim = null);
      } else {
        d.classList.add('closing');
        const h = body.offsetHeight;
        anim = body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: Math.min(320, 140 + h * 0.4), easing: 'cubic-bezier(.4,0,.6,1)' });
        anim.onfinish = () => {
          d.open = false;
          d.classList.remove('closing');
          anim = null;
        };
      }
    });
  });
}

// Segmented control with a sliding thumb: sets --n and --i for CSS.
export function setSeg(seg, index) {
  const buttons = [...seg.querySelectorAll('button')];
  seg.style.setProperty('--n', buttons.length);
  seg.style.setProperty('--i', index);
  buttons.forEach((b, j) => {
    b.classList.toggle('on', j === index);
    if (b.hasAttribute('aria-checked')) b.setAttribute('aria-checked', j === index);
    if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', j === index);
  });
}

// Snow burst around an element, used when a lesson is marked as done.
export function burst(target, colors = ['#12a150', '#0a6ad6', '#ff7a1a', '#ffffff']) {
  if (reduced() || !target) return;
  const r = target.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.style.left = `${r.left + r.width / 2}px`;
  layer.style.top = `${r.top + r.height / 2}px`;
  document.body.append(layer);
  const n = 18;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const d = 46 + Math.random() * 52;
    const size = 5 + Math.random() * 6;
    p.style.cssText = `width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
    layer.append(p);
    p.animate(
      [
        { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 14}px)) scale(1)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.15}px), calc(-50% + ${Math.sin(a) * d * 1.15 + 26}px)) scale(0.3)`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 300, easing: 'cubic-bezier(.15,.8,.3,1)', fill: 'forwards' },
    );
  }
  setTimeout(() => layer.remove(), 1300);
}

// Short attention pulse on an element.
export function pop(n) {
  if (reduced() || !n) return;
  n.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
}
