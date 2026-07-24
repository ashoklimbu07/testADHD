import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { A, DARK, MUTED, BG, DAY_NAMES, MONTH_NAMES } from '../../constants';
import { fmtT } from '../../utils/date';
import IconBtn from '../atoms/IconBtn';

export default function CalendarView({ calY, calM, calCells, selDate, selEvs, setSel, prevMonth, nextMonth, toggleDone, openModal }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 10px' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: DARK }}>{MONTH_NAMES[calM]} {calY}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn onClick={prevMonth} style={{ width: 34, height: 34, borderRadius: '50%', background: BG }}>
            <ChevronLeft size={16} color={DARK} strokeWidth={2.5} />
          </IconBtn>
          <IconBtn onClick={nextMonth} style={{ width: 34, height: 34, borderRadius: '50%', background: BG }}>
            <ChevronRight size={16} color={DARK} strokeWidth={2.5} />
          </IconBtn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 12px' }}>
        {DAY_NAMES.map((n) => (
          <div key={n} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: MUTED, padding: '6px 0' }}>{n[0]}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 12px 8px' }}>
        {calCells.map((c, i) => (
          <button key={i} onClick={() => setSel(c.iso)} style={{ height: 46, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'inherit', padding: 0 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, background: c.bg, color: c.fg }}>{c.num}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.dot }} />
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #ECE8E2', background: BG, flex: 1, padding: '16px 20px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{DAY_NAMES[selDate.getDay()]}, {MONTH_NAMES[selDate.getMonth()]} {selDate.getDate()}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{selEvs.length === 1 ? '1 event' : `${selEvs.length} events`}</span>
        </div>
        {selEvs.length === 0 ? (
          <div style={{ fontSize: 13.5, color: MUTED, padding: '14px 0' }}>No events yet — tap + to add one.</div>
        ) : selEvs.map((e) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', border: '1px solid #ECE8E2', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>{e.emoji || '😀'}</div>
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => openModal(e)}>
              <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{fmtT(e.start)}{e.end ? ` – ${fmtT(e.end)}` : ''}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: e.done ? MUTED : DARK, textDecoration: e.done ? 'line-through' : 'none' }}>{e.title}</div>
            </div>
            <button onClick={() => toggleDone(e.id)} style={{ width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', background: e.done ? A : '#FFFFFF', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
              {e.done && <Check size={12} color="#FFFFFF" strokeWidth={3.5} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
