import { toDate, minToT, toMin } from '../utils/date';
import { planFromTranscript } from '../utils/plan';

// Wires the schedule/voice/modal hooks together into the app's event handlers.
export function useAppActions({ tab, setTab, setHomeView, sel, setSel, setCalY, setCalM, pending, setPending, setLastAdded, typeText, setTypeSheetOpen, schedule, voice, eventModal }) {
  const generateBreakdown = (finalTranscript) => {
    const plan = planFromTranscript(finalTranscript);
    const slot = schedule.findSlot(plan.estimateMin);
    setHomeView('breakdown');
    setPending({ ...plan, transcript: finalTranscript, date: slot.date, start: slot.start, end: minToT(toMin(slot.start) + plan.estimateMin) });
  };

  const startListening = () => { setHomeView('listening'); voice.begin(); };
  const stopListening = () => voice.end(generateBreakdown, () => setHomeView('voice'));
  const submitTyped = () => {
    const t = typeText.trim();
    if (!t) return;
    setTypeSheetOpen(false);
    setHomeView('listening');
    voice.typeSubmit(t, generateBreakdown);
  };

  const confirmPending = () => {
    if (!pending) return;
    const id = schedule.addEvent(pending);
    setHomeView('schedule');
    setSel(pending.date);
    setPending(null);
    setLastAdded(id);
  };
  const adjustPending = () => {
    if (!pending) return;
    eventModal.openModal({
      id: null, origDate: pending.date, title: pending.title, date: pending.date,
      start: pending.start, end: pending.end, emoji: pending.emoji,
      subs: pending.subs.map((s) => `${s.t} (${s.d})`), fromPending: true,
    });
  };
  const discardPending = () => { setPending(null); setHomeView('voice'); };

  const saveModal = () => {
    if (!eventModal.canSave) return;
    const id = schedule.upsertEvent(eventModal.modal);
    if (tab === 'home') setHomeView('schedule');
    setSel(eventModal.modal.date);
    if (eventModal.modal.fromPending) { setPending(null); setLastAdded(id); }
    eventModal.closeModal();
  };
  const deleteModal = () => {
    if (!eventModal.modal?.id) return;
    schedule.deleteEvent(eventModal.modal.origDate, eventModal.modal.id);
    eventModal.closeModal();
  };
  const openEventModal = (e) => eventModal.openModal({ id: e.id, origDate: sel, title: e.title, date: sel, start: e.start, end: e.end || '', emoji: e.emoji || '😀' });

  const goHome = () => { setTab('home'); setHomeView('voice'); };
  const goTab = (t) => () => {
    if (t === 'calendar') { const d = toDate(sel); setCalY(d.getFullYear()); setCalM(d.getMonth()); }
    setTab(t);
  };

  return {
    startListening, stopListening, submitTyped,
    confirmPending, adjustPending, discardPending,
    saveModal, deleteModal, openEventModal,
    goHome, goTab,
  };
}
