import { ChevronLeft, Check, Clock } from 'lucide-react';
import { A, DARK, MUTED, BG, LIGHT, A_BG } from '../../constants';
import { MONTH_NAMES } from '../../constants';
import { relLabel } from '../../utils/date';
import IconBtn from '../atoms/IconBtn';

export default function Schedule({ tab, selDate, sel, days, nodes, showBackToVoice, goHome, setSel, toggleDone }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: BG, padding: '20px 8px 4px', borderBottom: '1px solid #ECE8E2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 8px' }}>
          {showBackToVoice ? (
            <IconBtn onClick={goHome} style={{ gap: 6, fontSize: 12, fontWeight: 700, color: A }}>
              <ChevronLeft size={13} color={A} strokeWidth={2.5} /> Voice
            </IconBtn>
          ) : <span />}
          {tab === 'tasks' && <span style={{ fontSize: 15, fontWeight: 800, color: DARK }}>Tasks</span>}
          <span style={{ fontSize: 15, fontWeight: 800, color: DARK }}>{MONTH_NAMES[selDate.getMonth()]} {selDate.getFullYear()}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{relLabel(sel)}</span>
        </div>
        <div style={{ display: 'flex' }}>
          {days.map((d) => (
            <button key={d.iso} onClick={() => setSel(d.iso)} style={{ flex: 1, background: 'none', border: 'none', padding: '2px 0 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: d.nameColor }}>{d.name}</span>
              <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, background: d.bg, color: d.fg, transition: 'background .18s' }}>{d.num}</span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.dot }} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 0 120px' }}>
        {nodes.map((n) => (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '64px 56px 1fr 52px', position: 'relative', minHeight: 104 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, paddingTop: 15, textAlign: 'right', paddingRight: 8 }}>{n.timeShort}</div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {n.notLast && <div style={{ position: 'absolute', left: '50%', top: 6, bottom: -6, borderLeft: '2px dashed #E4E0D9', transform: 'translateX(-1px)' }} />}
              {n.kind === 'wake' && <IconBtn onClick={n.onTap} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: A, fontSize: 20 }}>{n.emoji}</IconBtn>}
              {n.kind === 'sleep' && <IconBtn onClick={n.onTap} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: LIGHT, fontSize: 20 }}>{n.emoji}</IconBtn>}
              {n.isPill && <IconBtn onClick={n.onTap} style={{ position: 'relative', width: 44, height: n.pillH, borderRadius: 22, background: A, fontSize: 18 }}>{n.emoji}</IconBtn>}
              {n.isDot && <IconBtn onClick={n.onTap} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', border: `2px solid ${A}`, fontSize: 20 }}>{n.emoji}</IconBtn>}
            </div>
            <div style={{ padding: '8px 4px 0 12px', minWidth: 0, cursor: 'pointer' }} onClick={n.onTap}>
              <div style={{ background: n.hlBg, borderRadius: 12, padding: n.hlPad, display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div style={{ fontSize: 12.5, color: MUTED, fontWeight: 500 }}>{n.timeLabel}</div>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: n.titleColor, textDecoration: n.deco, marginTop: 2 }}>{n.title}</div>
                {n.stepsLabel && (
                  <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5, background: A_BG, borderRadius: 99, padding: '3px 9px', fontSize: 11, fontWeight: 800, color: A }}>{n.stepsLabel}</div>
                )}
              </div>
              {n.gapLabel && (
                <div style={{ marginTop: 28, fontSize: 13, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={MUTED} strokeWidth={2} />
                  <span>Free for <span style={{ color: A, fontWeight: 700 }}>{n.gapLabel}</span></span>
                </div>
              )}
            </div>
            <div style={{ paddingTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              {n.isEvent && (
                <button onClick={(e) => { e.stopPropagation(); toggleDone(sel, n.id); }} style={{ width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', background: n.checkBg, border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {n.done && <Check size={13} color="#FFFFFF" strokeWidth={3.5} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
