import { ChevronRight } from 'lucide-react';
import { DARK, MUTED, BG } from '../../constants';

export default function SettingsView({ workStart, setWorkStart, workEnd, setWorkEnd }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 8 }}>Settings</div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: MUTED, marginTop: 4 }}>WORKING HOURS</div>
      <div style={{ border: '1px solid #ECE8E2', borderRadius: 16, overflow: 'hidden', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #ECE8E2' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>Start</span>
          <input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value || '09:00')} style={{ border: 'none', background: BG, borderRadius: 10, padding: '7px 10px', fontSize: 14, fontWeight: 600, color: DARK, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>End</span>
          <input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value || '18:00')} style={{ border: 'none', background: BG, borderRadius: 10, padding: '7px 10px', fontSize: 14, fontWeight: 600, color: DARK, fontFamily: 'inherit' }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, padding: '0 4px' }}>The assistant only schedules tasks inside this window.</div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: MUTED, marginTop: 12 }}>GENERAL</div>
      <div style={{ border: '1px solid #ECE8E2', borderRadius: 16, overflow: 'hidden', background: '#FFFFFF' }}>
        {['Notifications', 'Appearance', 'Account'].map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: i < 2 ? '1px solid #ECE8E2' : 'none' }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{t}</span>
            <ChevronRight size={15} color={MUTED} strokeWidth={2.5} />
          </div>
        ))}
      </div>
    </div>
  );
}
