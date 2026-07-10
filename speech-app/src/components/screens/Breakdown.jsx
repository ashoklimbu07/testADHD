import { Mic, Clock } from 'lucide-react';
import { A, DARK, MUTED, BG, A_BG } from '../../constants';
import { durLabel, relLabel, fmtT } from '../../utils/date';

export default function Breakdown({ pending, workStart, workEnd, onConfirm, onAdjust, onDiscard }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: BG, overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 130px', display: 'flex', flexDirection: 'column', gap: 16, animation: 'df-up .35s ease-out' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: DARK }}>Here's your plan</div>
        <div style={{ background: '#FFFFFF', border: '1px solid #ECE8E2', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Mic size={16} color={MUTED} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, fontStyle: 'italic' }}>"{pending.transcript}"</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #ECE8E2', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: A_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>{pending.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: DARK }}>{pending.title}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginTop: 2 }}>Estimated {durLabel(pending.estimateMin)} · due {pending.deadline}</div>
            </div>
            {pending.energyLevel && (
              <div style={{ flexShrink: 0, background: A_BG, color: A, fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '5px 10px', whiteSpace: 'nowrap' }}>{pending.energyLevel}</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pending.subs.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', paddingBottom: 16 }}>
                {i < pending.subs.length - 1 && (
                  <div style={{ position: 'absolute', left: 11, top: 24, bottom: -2, borderLeft: '2px dashed #E4E0D9' }} />
                )}
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF', border: `2px solid ${A}`, color: A, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box', position: 'relative' }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{s.t}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginLeft: 8 }}>{s.d}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: A_BG, borderRadius: 14, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'center' }}>
            <Clock size={18} color={A} strokeWidth={2} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{relLabel(pending.date)} · {fmtT(pending.start)} – {fmtT(pending.end)}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 1 }}>Earliest free slot in your working hours ({fmtT(workStart)} – {fmtT(workEnd)})</div>
            </div>
          </div>
        </div>

        <button onClick={onConfirm} style={{ border: 'none', background: A, color: '#FFFFFF', borderRadius: 16, padding: 16, fontSize: 15.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 20px rgba(242,145,127,.35)' }}>
          Add to schedule
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAdjust} style={{ flex: 1, border: '1px solid #ECE8E2', background: '#FFFFFF', color: DARK, borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Adjust time</button>
          <button onClick={onDiscard} style={{ flex: 1, border: 'none', background: 'none', color: MUTED, borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Start over</button>
        </div>
      </div>
    </div>
  );
}
