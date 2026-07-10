import { useState } from 'react';
import { fmt, toDate, toMin } from './utils/date';
import { buildWeekStrip, buildCalendarCells, buildTimelineNodes } from './utils/viewData';
import { useSchedule } from './hooks/useSchedule';
import { useVoiceCapture } from './hooks/useVoiceCapture';
import { useEventModal } from './hooks/useEventModal';
import { useAppActions } from './hooks/useAppActions';

import BottomNav from './components/BottomNav';
import Fabs from './components/Fabs';
import VoiceHome from './components/screens/VoiceHome';
import VoiceListening from './components/screens/VoiceListening';
import Breakdown from './components/screens/Breakdown';
import Schedule from './components/screens/Schedule';
import CalendarView from './components/screens/CalendarView';
import SettingsView from './components/screens/SettingsView';
import TypeSheet from './components/sheets/TypeSheet';
import EmojiPicker from './components/sheets/EmojiPicker';
import EventModal from './components/sheets/EventModal';

const KEYFRAMES = `
  @keyframes df-pulse { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(2); opacity: 0 } }
  @keyframes df-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
  @keyframes df-blink { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
  @keyframes df-up { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } }
`;

export default function App() {
  const [tab, setTab] = useState('home');
  const [homeView, setHomeView] = useState('voice'); // voice | listening | breakdown | schedule
  const [sel, setSel] = useState(() => fmt(new Date()));
  const [calY, setCalY] = useState(() => new Date().getFullYear());
  const [calM, setCalM] = useState(() => new Date().getMonth());
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [typeText, setTypeText] = useState('');
  const [pending, setPending] = useState(null);
  const [lastAdded, setLastAdded] = useState(null);

  const schedule = useSchedule();
  const voice = useVoiceCapture({ onError: () => setHomeView('voice') });
  const eventModal = useEventModal();
  const actions = useAppActions({
    tab, setTab, setHomeView, sel, setSel, setCalY, setCalM,
    pending, setPending, setLastAdded, typeText, setTypeSheetOpen,
    schedule, voice, eventModal,
  });

  // ── Derived view data ────────────────────────────────────────────────
  const todayIso = fmt(new Date());
  const selDate = toDate(sel);
  const todayCount = (schedule.events[todayIso] || []).length;
  const todayCountLabel = todayCount === 0 ? 'nothing scheduled today' : (todayCount === 1 ? '1 task today' : `${todayCount} tasks today`);

  const hvIdle = tab === 'home' && homeView === 'voice';
  const hvListening = tab === 'home' && homeView === 'listening';
  const hvBreakdown = tab === 'home' && homeView === 'breakdown';
  const hvSchedule = (tab === 'home' && homeView === 'schedule') || tab === 'tasks';
  const showBackToVoice = tab === 'home' && homeView === 'schedule';

  const days = buildWeekStrip(selDate, sel, todayIso, schedule.events);
  const calCells = buildCalendarCells(calY, calM, sel, todayIso, schedule.events);
  const nodes = hvSchedule
    ? buildTimelineNodes({
        sel, events: schedule.events, workStart: schedule.workStart, workEnd: schedule.workEnd, lastAdded,
        onEventTap: actions.openEventModal, onEndpointTap: () => setTab('settings'),
      })
    : [];
  const selEvs = (schedule.events[sel] || []).slice().sort((a, b) => toMin(a.start) - toMin(b.start));

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto', background: '#FFFFFF', overflow: 'hidden', fontFamily: 'inherit' }}>
      <style>{KEYFRAMES}</style>

      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {hvIdle && <VoiceHome todayCountLabel={todayCountLabel} micError={voice.micError} onStart={actions.startListening} onOpenTypeSheet={() => { setTypeSheetOpen(true); setTypeText(''); }} />}
        {hvListening && <VoiceListening listenPhase={voice.listenPhase} liveTranscript={voice.liveTranscript} onStop={actions.stopListening} debugLog={voice.debugLog} micError={voice.micError} micReady={voice.micReady} />}
        {hvBreakdown && pending && <Breakdown pending={pending} workStart={schedule.workStart} workEnd={schedule.workEnd} onConfirm={actions.confirmPending} onAdjust={actions.adjustPending} onDiscard={actions.discardPending} />}
        {hvSchedule && <Schedule tab={tab} selDate={selDate} sel={sel} days={days} nodes={nodes} showBackToVoice={showBackToVoice} goHome={actions.goHome} setSel={setSel} toggleDone={schedule.toggleDone} />}
        {tab === 'calendar' && (
          <CalendarView
            calY={calY} calM={calM} calCells={calCells} selDate={selDate} selEvs={selEvs}
            setSel={setSel}
            prevMonth={() => { const d = new Date(calY, calM - 1, 1); setCalY(d.getFullYear()); setCalM(d.getMonth()); }}
            nextMonth={() => { const d = new Date(calY, calM + 1, 1); setCalY(d.getFullYear()); setCalM(d.getMonth()); }}
            toggleDone={(id) => schedule.toggleDone(sel, id)}
            openModal={actions.openEventModal}
          />
        )}
        {tab === 'settings' && <SettingsView workStart={schedule.workStart} setWorkStart={schedule.setWorkStart} workEnd={schedule.workEnd} setWorkEnd={schedule.setWorkEnd} />}
      </div>

      <BottomNav tab={tab} goHome={actions.goHome} goTab={actions.goTab} />
      <Fabs
        micFabVisible={((tab === 'home' && homeView === 'schedule') || tab === 'tasks') && !eventModal.modal}
        addFabVisible={tab === 'calendar' && !eventModal.modal}
        onMic={actions.goHome}
        onAdd={() => eventModal.openModal({ id: null, origDate: sel, title: '', date: sel, start: '', end: '' })}
      />

      <TypeSheet open={typeSheetOpen} typeText={typeText} setTypeText={setTypeText} onClose={() => setTypeSheetOpen(false)} onSubmit={actions.submitTyped} />
      <EmojiPicker open={eventModal.emojiPickerOpen} onClose={() => eventModal.setEmojiPickerOpen(false)} onPick={(em) => { eventModal.patchModal({ emoji: em }); eventModal.setEmojiPickerOpen(false); }} />
      <EventModal modal={eventModal.modal} m={eventModal.m} canSave={eventModal.canSave} patchModal={eventModal.patchModal} onClose={eventModal.closeModal} onOpenEmojiPicker={() => eventModal.setEmojiPickerOpen(true)} onSave={actions.saveModal} onDelete={actions.deleteModal} />
    </div>
  );
}
