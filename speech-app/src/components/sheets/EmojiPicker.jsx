import { X } from 'lucide-react';
import { DARK, MUTED, BG, LIGHT, EMOJI_LIST } from '../../constants';
import IconBtn from '../atoms/IconBtn';

export default function EmojiPicker({ open, onClose, onPick }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(46,53,71,.45)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
        <IconBtn onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: BG }}>
          <X size={16} color={MUTED} strokeWidth={2.5} />
        </IconBtn>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LIGHT, alignSelf: 'center', marginTop: -6 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>Pick an emoji</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
          {EMOJI_LIST.map((em) => (
            <button key={em} onClick={() => onPick(em)} style={{ width: '100%', aspectRatio: '1', border: 'none', background: BG, borderRadius: 14, cursor: 'pointer', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{em}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
