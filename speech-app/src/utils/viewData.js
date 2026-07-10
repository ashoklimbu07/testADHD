import { A, LIGHT, DARK, MUTED, A_BG } from '../constants';
import { fmt, addDays, toMin, fmtT, durLabel } from './date';

export function buildWeekStrip(selDate, sel, todayIso, events) {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = addDays(selDate, i);
    const iso = fmt(d);
    const isSel = iso === sel, isToday = iso === todayIso;
    days.push({
      iso, name: d.toLocaleDateString('en-US', { weekday: 'short' }), num: d.getDate(),
      nameColor: isSel ? DARK : MUTED,
      bg: isSel ? A : (isToday ? LIGHT : 'transparent'),
      fg: isSel ? '#FFFFFF' : DARK,
      dot: (events[iso] || []).length ? A : 'transparent',
    });
  }
  return days;
}

export function buildCalendarCells(calY, calM, sel, todayIso, events) {
  const first = new Date(calY, calM, 1);
  const startOffset = first.getDay();
  const dim = new Date(calY, calM + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + dim) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(calY, calM, i - startOffset + 1);
    const iso = fmt(d);
    const inMonth = d.getMonth() === calM;
    const isSel = iso === sel, isToday = iso === todayIso;
    cells.push({
      iso, num: d.getDate(),
      bg: isSel ? A : (isToday ? LIGHT : 'transparent'),
      fg: isSel ? '#FFFFFF' : (inMonth ? DARK : '#C9CCD1'),
      dot: (events[iso] || []).length ? (isSel ? DARK : A) : 'transparent',
    });
  }
  return cells;
}

export function buildTimelineNodes({ sel, events, workStart, workEnd, lastAdded, onEventTap, onEndpointTap, onStepsTap }) {
  const evs = (events[sel] || []).slice().sort((a, b) => toMin(a.start) - toMin(b.start));
  const items = [{ kind: 'wake', start: workStart, end: null, title: 'Work starts', emoji: '🕘' }]
    .concat(evs.map((e) => ({ kind: 'event', ...e })))
    .concat([{ kind: 'sleep', start: workEnd, end: null, title: 'Work ends', emoji: '🏁' }]);

  return items.map((it, i) => {
    const last = i === items.length - 1;
    const next = items[i + 1];
    let gapLabel = false;
    if (next) {
      const gap = toMin(next.start) - toMin(it.end || it.start);
      if (gap >= 60) gapLabel = durLabel(gap);
    }
    const dur = it.end ? toMin(it.end) - toMin(it.start) : 0;
    const isEvent = it.kind === 'event';
    const isNew = isEvent && it.id === lastAdded;
    let timeLabel = fmtT(it.start);
    if (it.end) timeLabel += ` – ${fmtT(it.end)} (${durLabel(dur)})`;
    return {
      id: it.id || it.kind, kind: it.kind, emoji: it.emoji,
      isPill: isEvent && !!it.end, isDot: isEvent && !it.end, isEvent,
      notLast: !last, timeShort: fmtT(it.start), timeLabel, title: it.title,
      titleColor: isEvent && it.done ? MUTED : DARK,
      deco: isEvent && it.done ? 'line-through' : 'none',
      done: !!it.done, checkBg: it.done ? A : '#FFFFFF',
      pillH: Math.min(120, Math.max(66, dur * 0.7)),
      hlBg: isNew ? A_BG : 'transparent', hlPad: isNew ? '8px 12px' : '0',
      stepsLabel: (it.subs && it.subs.length) ? `${it.subs.length} steps` : false,
      gapLabel,
      onTap: () => (isEvent ? onEventTap(it) : onEndpointTap()),
      onStepsTap: () => onStepsTap(it),
    };
  });
}
