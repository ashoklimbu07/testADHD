import { X, Trash2 } from 'lucide-react';
import { A, DARK, MUTED, BG, LIGHT } from '../../constants';
import IconBtn from '../atoms/IconBtn';

export default function EventModal({ modal, m, canSave, patchModal, onClose, onOpenEmojiPicker, onSave, onDelete }) {
  if (!modal) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(46,53,71,.45)', zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '22px 22px 36px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
        <IconBtn onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: BG }}>
          <X size={16} color={MUTED} strokeWidth={2.5} />
        </IconBtn>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LIGHT, alignSelf: 'center', marginTop: -6 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>{m.id ? 'Edit event' : (m.fromPending ? 'Adjust time' : 'New event')}</span>
          {m.id && (
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: A, fontFamily: 'inherit', padding: 4 }}>
              <Trash2 size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />Delete
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input type="text" placeholder="Event title" value={m.title || ''} onChange={(e) => patchModal({ title: e.target.value })}
              style={{ border: 'none', background: BG, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, color: DARK, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div onClick={onOpenEmojiPicker} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${LIGHT}`, cursor: 'pointer', fontSize: 20 }}>{m.emoji || '😀'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: MUTED }}>DATE</span>
          <input type="date" value={m.date || ''} onChange={(e) => patchModal({ date: e.target.value })}
            style={{ border: 'none', background: BG, borderRadius: 12, padding: '12px 14px', fontSize: 14.5, fontWeight: 600, color: DARK, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: MUTED }}>STARTS</span>
            <input type="time" value={m.start || ''} onChange={(e) => patchModal({ start: e.target.value })}
              style={{ border: 'none', background: BG, borderRadius: 12, padding: '12px 14px', fontSize: 14.5, fontWeight: 600, color: DARK, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: MUTED }}>ENDS (OPTIONAL)</span>
            <input type="time" value={m.end || ''} onChange={(e) => patchModal({ end: e.target.value })}
              style={{ border: 'none', background: BG, borderRadius: 12, padding: '12px 14px', fontSize: 14.5, fontWeight: 600, color: DARK, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button onClick={onSave} style={{ border: 'none', background: A, color: '#FFFFFF', borderRadius: 14, padding: 15, fontSize: 15.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: canSave ? 1 : 0.45, marginTop: 4 }}>
          {m.id ? 'Save changes' : (m.fromPending ? 'Add to schedule' : 'Add to timeline')}
        </button>
      </div>
    </div>
  );
}
