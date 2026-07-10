import { Mic, Calendar as CalendarIcon, ListChecks, Settings as SettingsIcon } from 'lucide-react';
import { A } from '../constants';
import IconBtn from './atoms/IconBtn';

export default function BottomNav({ tab, goHome, goTab }) {
  const homeC = tab === 'home' ? A : '#A9ADB5';
  const calC = tab === 'calendar' ? A : '#A9ADB5';
  const setC = tab === 'settings' ? A : '#A9ADB5';
  const tasksC = tab === 'tasks' ? A : '#A9ADB5';

  return (
    <div style={{ display: 'flex', borderTop: '1px solid #ECE8E2', background: '#FFFFFF', padding: '8px 6px 6px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
      <IconBtn onClick={goHome} style={{ flex: 1, flexDirection: 'column', gap: 3, padding: '4px 0' }}>
        <Mic size={22} color={homeC} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: homeC }}>Voice</span>
      </IconBtn>
      <IconBtn onClick={goTab('calendar')} style={{ flex: 1, flexDirection: 'column', gap: 3, padding: '4px 0' }}>
        <CalendarIcon size={22} color={calC} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: calC }}>Calendar</span>
      </IconBtn>
      <IconBtn onClick={goTab('tasks')} style={{ flex: 1, flexDirection: 'column', gap: 3, padding: '4px 0' }}>
        <ListChecks size={22} color={tasksC} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: tasksC }}>Tasks</span>
      </IconBtn>
      <IconBtn onClick={goTab('settings')} style={{ flex: 1, flexDirection: 'column', gap: 3, padding: '4px 0' }}>
        <SettingsIcon size={22} color={setC} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: setC }}>Settings</span>
      </IconBtn>
    </div>
  );
}
