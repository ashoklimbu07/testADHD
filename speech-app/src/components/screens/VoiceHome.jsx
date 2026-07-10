import { AlertTriangle, PencilLine } from 'lucide-react';
import { DARK, MUTED, BG, speechSupported, DAY_NAMES, MONTH_NAMES } from '../../constants';
import MicOrb from '../atoms/MicOrb';
import IconBtn from '../atoms/IconBtn';

export default function VoiceHome({ todayCountLabel, micError, onStart, onOpenTypeSheet }) {
  const now = new Date();
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: BG }}>
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: DARK }}>
          {now.getHours() < 12 ? 'Good morning' : (now.getHours() < 18 ? 'Good afternoon' : 'Good evening')}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: MUTED, marginTop: 4 }}>
          {DAY_NAMES[now.getDay()]}, {MONTH_NAMES[now.getMonth()]} {now.getDate()} · {todayCountLabel}
        </div>
      </div>
      {!speechSupported && (
        <div style={{ margin: '16px 28px 0', display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FFF7ED', border: '1px solid #FDE1C7', borderRadius: 14, padding: '10px 12px', color: '#B45309', fontSize: 12.5, lineHeight: 1.4 }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          Web Speech API isn't supported here. Use Chrome or Edge, or type instead.
        </div>
      )}
      {micError && (
        <div style={{ margin: '16px 28px 0', display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '10px 12px', color: '#B91C1C', fontSize: 12.5, lineHeight: 1.4 }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {micError}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 32px' }}>
        <MicOrb listening={false} onClick={onStart} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: DARK }}>Tell me what's on your plate</div>
          <div style={{ fontSize: 13.5, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
            Speak naturally — I'll break it into steps<br />and find time in your working hours.
          </div>
        </div>
      </div>
      <div style={{ padding: '0 28px 118px', display: 'flex', justifyContent: 'center' }}>
        <IconBtn onClick={onOpenTypeSheet} style={{ fontSize: 13.5, fontWeight: 700, color: MUTED, gap: 7, padding: '10px 14px' }}>
          <PencilLine size={15} color={MUTED} /> Too noisy? Type it instead
        </IconBtn>
      </div>
    </div>
  );
}
