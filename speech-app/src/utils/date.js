import { DAY_NAMES, MONTH_NAMES } from '../constants';

export const fmt = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const addDays = (d, n) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

export const toDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };

export const toMin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export const minToT = (mn) => `${String(Math.floor(mn / 60)).padStart(2, '0')}:${String(mn % 60).padStart(2, '0')}`;

export const fmtT = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
};

export const durLabel = (mins) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export const relLabel = (iso) => {
  const d = toDate(iso);
  const diff = Math.round((d - toDate(fmt(new Date()))) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
};
