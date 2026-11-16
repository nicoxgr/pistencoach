// Progress storage in localStorage. Every access is guarded: in private mode
// or with blocked storage the app keeps working with in-memory state.

const KEY = 'pistencoach';
const VERSION = 1;
export const STATUS = ['open', 'practicing', 'done'];

let data = load();

function empty() {
  return { version: VERSION, lessons: {}, onboardingDone: false };
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

export function setStatus(id, status) {
  data.lessons[id] = { ...data.lessons[id], status, updatedAt: new Date().toISOString() };
  save();
}

export function setNote(id, note) {
  data.lessons[id] = { ...data.lessons[id], note, updatedAt: new Date().toISOString() };
  save();
}

export function exportJson() {
  return JSON.stringify(data, null, 2);
}

export function importJson(text) {
  const d = JSON.parse(text);
  if (!d || d.version !== VERSION || typeof d.lessons !== 'object') throw new Error('Unbekanntes Format');
  data = { ...empty(), ...d };
  save();
}

export function reset() {
  data = empty();
  save();
}
