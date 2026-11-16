// Progress storage in localStorage. Every access is guarded: in private mode
// or with blocked storage the app keeps working with in-memory state.

const KEY = 'pistencoach';
const VERSION = 1;
export const STATUS = ['open', 'practicing', 'done'];

let data = load();

function empty() {
  return { version: VERSION, lessons: {}, log: [], onboardingDone: false, theme: 'auto' };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const d = JSON.parse(raw);
    return d && d.version === VERSION ? { ...empty(), ...d } : empty();
  } catch {
    return empty();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: keep in memory */
  }
}

export const getStatus = (id) => data.lessons[id]?.status || 'open';
export const getNote = (id) => data.lessons[id]?.note || '';

// History: one entry per status change, newest last. `entry` is either
// { id, status } for a lesson or { placement: level } for the placement.
function addLog(entry) {
  data.log = [...(data.log || []), { at: new Date().toISOString(), ...entry }].slice(-500);
}

export const getLog = () => data.log || [];
export const getUpdatedAt = (id) => data.lessons[id]?.updatedAt || null;

export function logPlacement(level) {
  addLog({ placement: level });
  save();
}

// `log: false` keeps bulk changes (placement) out of the history.
export function setStatus(id, status, { log = true } = {}) {
  const changed = getStatus(id) !== status;
  data.lessons[id] = { ...data.lessons[id], status, updatedAt: new Date().toISOString() };
  if (changed && log) addLog({ id, status });
  save();
}

export function setNote(id, note) {
  data.lessons[id] = { ...data.lessons[id], note, updatedAt: new Date().toISOString() };
  save();
}

export const getChecks = (id) => data.lessons[id]?.checks || [];

export function toggleCheck(id, i) {
  const set = new Set(getChecks(id));
  if (set.has(i)) set.delete(i);
  else set.add(i);
  data.lessons[id] = { ...data.lessons[id], checks: [...set].sort(), updatedAt: new Date().toISOString() };
  save();
  return set.has(i);
}

export const hasProgress = () => Object.values(data.lessons).some((l) => (l.status && l.status !== 'open') || l.note);
export const onboardingDone = () => data.onboardingDone;
export function setOnboardingDone() {
  data.onboardingDone = true;
  save();
}

export const getTheme = () => data.theme || 'auto';
export function setTheme(theme) {
  data.theme = theme;
  save();
}

export function exportJson() {
  return JSON.stringify(data, null, 2);
}

export function importJson(text) {
  const d = JSON.parse(text);
  if (!d || d.version !== VERSION || !d.lessons || typeof d.lessons !== 'object' || Array.isArray(d.lessons)) throw new Error('Unbekanntes Format');
  if (!Array.isArray(d.log)) d.log = [];
  data = { ...empty(), ...d };
  save();
}

export function reset() {
  data = { ...empty(), theme: getTheme() };
  save();
}
