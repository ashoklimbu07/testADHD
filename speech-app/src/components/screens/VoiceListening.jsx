import { AlertTriangle } from 'lucide-react';
import { A, DARK, MUTED, BG } from '../../constants';
import MicOrb from '../atoms/MicOrb';

export default function VoiceListening({ listenPhase, liveTranscript, onStop, debugLog, micError, micReady }) {
  const statusLabel = listenPhase !== 'listen' ? 'Breaking it down…' : (micReady ? 'Listening…' : 'Starting mic…');
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: BG }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 32px' }}>
        <MicOrb listening ringOn={listenPhase === 'listen' && micReady} onClick={onStop} />
        <div style={{ fontSize: 15, fontWeight: 800, color: A, letterSpacing: '.02em', animation: 'df-blink 1.4s ease-in-out infinite' }}>
          {statusLabel}
        </div>
        <div style={{
          minHeight: 96, width: '100%', maxWidth: 320, boxSizing: 'border-box',
          background: '#FFFFFF', border: '1px solid #ECE8E2', borderRadius: 16,
          padding: '14px 18px', textAlign: 'center', fontSize: 17, fontWeight: 700,
          color: liveTranscript ? DARK : MUTED, lineHeight: 1.55,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {liveTranscript || 'Say something…'}
        </div>
        {micError && (
          <div style={{ width: '100%', maxWidth: 320, boxSizing: 'border-box', display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '10px 12px', color: '#B91C1C', fontSize: 12.5, lineHeight: 1.4 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {micError}
          </div>
        )}
        {debugLog?.length > 0 && (
          <div style={{ width: '100%', maxWidth: 320, boxSizing: 'border-box', background: '#111827', borderRadius: 10, padding: '8px 10px', fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: '#a3e635', lineHeight: 1.5, maxHeight: 110, overflowY: 'auto' }}>
            {debugLog.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
      </div>
      <div style={{ padding: '0 28px 118px', display: 'flex', justifyContent: 'center' }}>
        {listenPhase === 'listen' && (
          <button onClick={onStop} style={{ background: '#FFFFFF', border: '1px solid #ECE8E2', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: DARK, padding: '12px 22px' }}>
            Done talking
          </button>
        )}
      </div>
    </div>
  );
}
