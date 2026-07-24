import { X } from 'lucide-react';
import { A, DARK, MUTED, BG, LIGHT } from '../../constants';
import IconBtn from '../atoms/IconBtn';

export default function TypeSheet({ open, typeText, setTypeText, onClose, onSubmit }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(46,53,71,.45)', zIndex: 45, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '22px 22px 36px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
        <IconBtn onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: BG }}>
          <X size={16} color={MUTED} strokeWidth={2.5} />
        </IconBtn>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LIGHT, alignSelf: 'center', marginTop: -6 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>Type what's on your plate</span>
        <textarea
          rows={3} placeholder="e.g. I need to finish my report by Friday…" value={typeText}
          onChange={(e) => setTypeText(e.target.value)}
          style={{ border: 'none', background: BG, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, color: DARK, fontFamily: 'inherit', resize: 'none' }}
        />
        <button onClick={onSubmit} style={{ border: 'none', background: A, color: '#FFFFFF', borderRadius: 14, padding: 15, fontSize: 15.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: typeText.trim() ? 1 : 0.45 }}>
          Break it down
        </button>
      </div>
    </div>
  );
}
