import { useState, useEffect } from 'react';
import { STORAGE_KEY } from '../constants';
import { fmt, addDays, toMin, minToT } from '../utils/date';
import { seedEvents } from '../utils/seed';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export function useSchedule() {
  const [events, setEvents] = useState(() => loadSaved()?.events || seedEvents());
  const [workStart, setWorkStart] = useState(() => loadSaved()?.workStart || '09:00');
  const [workEnd, setWorkEnd] = useState(() => loadSaved()?.workEnd || '18:00');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, workStart, workEnd })); } catch { /* ignore */ }
  }, [events, workStart, workEnd]);

  // First free gap inside working hours, scanning from today forward
  const findSlot = (durMin) => {
    const ws = toMin(workStart), we = toMin(workEnd);
    for (let d = 0; d < 14; d++) {
      const date = fmt(addDays(new Date(), d));
      let cursor = ws;
      if (d === 0) {
        const now = new Date();
        const nowM = now.getHours() * 60 + now.getMinutes() + 15;
        cursor = Math.max(ws, Math.ceil(nowM / 15) * 15);
      }
      const evs = (events[date] || []).slice().sort((a, b) => toMin(a.start) - toMin(b.start));
      let placed = null;
      for (const ev of evs) {
        const s = toMin(ev.start);
        if (s - cursor >= durMin) { placed = cursor; break; }
        cursor = Math.max(cursor, toMin(ev.end) || (s + 30));
      }
      if (placed === null && cursor + durMin <= we) placed = cursor;
      if (placed !== null && placed + durMin <= we) return { date, start: minToT(placed) };
    }
    return { date: fmt(new Date()), start: workStart };
  };

  const addEvent = (pending) => {
    const id = 'e' + Date.now();
    setEvents((ev) => ({
      ...ev,
      [pending.date]: (ev[pending.date] || []).concat([{
        id, title: pending.title, start: pending.start, end: pending.end, done: false, emoji: pending.emoji,
        subs: pending.subs.map((s) => ({ label: `${s.t} (${s.d})`, done: false })),
      }]),
    }));
    return id;
  };

  const toggleDone = (date, id) => {
    setEvents((ev) => ({
      ...ev,
      [date]: (ev[date] || []).map((e) => e.id === id ? { ...e, done: !e.done } : e),
    }));
  };

  const toggleSub = (date, id, index) => {
    setEvents((ev) => ({
      ...ev,
      [date]: (ev[date] || []).map((e) => e.id !== id ? e : {
        ...e,
        subs: e.subs.map((s, i) => i !== index ? s : { ...s, done: !s.done }),
      }),
    }));
  };

  // Insert/replace an event from a modal payload; returns the resulting id.
  const upsertEvent = (m) => {
    let newId = m.id;
    setEvents((ev) => {
      const copy = { ...ev };
      let done = false, subs = m.subs || null;
      if (m.id) {
        const prev = (copy[m.origDate] || []).find((e) => e.id === m.id);
        if (prev) { done = prev.done; subs = prev.subs || subs; }
        copy[m.origDate] = (copy[m.origDate] || []).filter((e) => e.id !== m.id);
      }
      const id = m.id || 'e' + Date.now();
      newId = id;
      let end = m.end || null;
      if (end && toMin(end) <= toMin(m.start)) end = null;
      const rec = { id, title: m.title.trim(), start: m.start, end, done, emoji: m.emoji || '😀' };
      if (subs) rec.subs = subs;
      copy[m.date] = (copy[m.date] || []).concat([rec]);
      return copy;
    });
    return newId;
  };

  const deleteEvent = (origDate, id) => {
    setEvents((ev) => ({ ...ev, [origDate]: (ev[origDate] || []).filter((e) => e.id !== id) }));
  };

  return { events, workStart, setWorkStart, workEnd, setWorkEnd, findSlot, addEvent, toggleDone, toggleSub, upsertEvent, deleteEvent };
}
