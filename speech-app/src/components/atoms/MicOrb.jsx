import { Mic, Square } from 'lucide-react';
import { A, speechSupported } from '../../constants';

export default function MicOrb({ listening, onClick, size = 148, ringOn = false }) {
  return (
    <button
      onClick={onClick}
      disabled={!speechSupported}
      style={{
        position: 'relative', width: size, height: size, borderRadius: '50%', background: A, border: 'none',
        cursor: speechSupported ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 16px 40px rgba(242,145,127,.45)',
        animation: listening ? 'none' : 'df-breathe 3.2s ease-in-out infinite',
        opacity: speechSupported ? 1 : 0.5, flex: 'none',
      }}
    >
      {listening && ringOn && (
        <>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${A}`, animation: 'df-pulse 1.6s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${A}`, animation: 'df-pulse 1.6s ease-out .55s infinite' }} />
        </>
      )}
      {listening
        ? <Square size={44} fill="#fff" color="#fff" style={{ position: 'relative', zIndex: 1 }} />
        : <Mic size={52} color="#fff" strokeWidth={1.8} style={{ position: 'relative', zIndex: 1 }} />}
    </button>
  );
}
