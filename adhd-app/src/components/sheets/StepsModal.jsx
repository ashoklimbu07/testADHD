import { X, Check } from 'lucide-react';
import { A, DARK, MUTED, BG, LIGHT } from '../../constants';
import IconBtn from '../atoms/IconBtn';

export default function StepsModal({ steps, onClose, onToggle }) {
  if (!steps) return null;
  const { title, subs } = steps;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(46,53,71,.45)', zIndex: 55, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '22px 22px 36px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
        <IconBtn onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: BG }}>
          <X size={16} color={MUTED} strokeWidth={2.5} />
        </IconBtn>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LIGHT, alignSelf: 'center', marginTop: -6 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>{title}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(subs || []).map((s, i) => (
            <button key={i} onClick={() => onToggle(i)} style={{
              display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: BG, borderRadius: 12, padding: '12px 14px', fontFamily: 'inherit',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.done ? A : '#FFFFFF', border: `2px solid ${A}`,
              }}>
                {s.done && <Check size={13} color="#FFFFFF" strokeWidth={3.5} />}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: s.done ? MUTED : DARK, textDecoration: s.done ? 'line-through' : 'none' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
