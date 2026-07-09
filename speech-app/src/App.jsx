import { useState, useEffect, useRef } from 'react';
import './App.css';

// ── Web Speech API ─────────────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = Boolean(SpeechRecognition);

// Module-level singleton — immune to React StrictMode double-mount
let recInstance = null;

// ── Mic button ─────────────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button
      className={`mic-btn ${isListening ? 'listening' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening && <span className="pulse-ring" />}
      {isListening && <span className="pulse-ring delay" />}
      <span className="mic-icon" aria-hidden="true">
        {isListening ? '⏹' : '🎙️'}
      </span>
    </button>
  );
}

// ── Languages ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'zh-CN', label: '中文 (普通话)' },
  { code: 'ja-JP', label: '日本語' },
];

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [transcript,   setTranscript]   = useState('');
  const [interim,      setInterim]      = useState('');
  const [isListening,  setIsListening]  = useState(false);
  const [lang,         setLang]         = useState('en-US');
  const [error,        setError]        = useState('');
  const [copied,       setCopied]       = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vscribe-history') || '[]'); }
    catch { return []; }
  });

  // Use refs so handlers always see latest values without stale closures
  const listeningRef   = useRef(false);
  // finalTextRef accumulates only confirmed-final text across sessions
  const finalTextRef   = useRef('');

  // ── Start a fresh recognition session ─────────────────────────────────
  const startSession = (currentLang) => {
    // Destroy any existing instance cleanly
    if (recInstance) {
      recInstance.onresult = null;
      recInstance.onerror  = null;
      recInstance.onend    = null;
      try { recInstance.abort(); } catch { /* ignore */ }
      recInstance = null;
    }

    if (!supported) return;

    const rec = new SpeechRecognition();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = currentLang;

    // ── onresult ────────────────────────────────────────────────────────
    // KEY APPROACH: rebuild full text from e.results on every event.
    // e.results is the authoritative list — no manual accumulation.
    // Final segments go into finalTextRef; the last non-final segment
    // is shown as interim. This is duplicate-proof.
    rec.onresult = (e) => {
      let finalParts  = '';
      let interimPart = '';

      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalParts += r[0].transcript + ' ';
        } else {
          // Only the last non-final result is shown as interim
          interimPart = r[0].transcript;
        }
      }

      // finalParts now contains everything confirmed in THIS session.
      // Combine with text saved from previous sessions.
      const combined = finalTextRef.current + finalParts;
      setTranscript(combined);
      setInterim(interimPart);
    };

    // ── onerror ─────────────────────────────────────────────────────────
    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      const msgs = {
        'not-allowed': 'Microphone access denied. Please allow mic permission.',
        network:       'Network error. Check your connection.',
      };
      setError(msgs[e.error] ?? `Speech error: ${e.error}`);
      listeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    // ── onend ────────────────────────────────────────────────────────────
    // Browser ends the session after silence. If still supposed to listen,
    // save current final text and start a fresh session so e.results
    // starts from 0 again — no risk of replaying old results.
    rec.onend = () => {
      setInterim('');
      if (listeningRef.current) {
        // Snapshot whatever is in transcript state into the ref
        // so the next session starts fresh but keeps the text
        setTranscript((current) => {
          finalTextRef.current = current;
          return current;
        });
        setTimeout(() => {
          if (listeningRef.current) {
            startSession(langRef.current);
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recInstance = rec;
    try {
      rec.start();
    } catch {
      setError('Could not start microphone.');
      listeningRef.current = false;
      setIsListening(false);
    }
  };

  // Keep a ref to lang so onend closure always has the current value
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Toggle mic ─────────────────────────────────────────────────────────
  const toggleListening = () => {
    setError('');
    if (listeningRef.current) {
      // Stop
      listeningRef.current = false;
      try { recInstance?.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      // Reset session accumulator
      finalTextRef.current = '';
      setTranscript('');
      setInterim('');
      listeningRef.current = true;
      setIsListening(true);
      startSession(lang);
    }
  };

  // Stop if language changes while listening
  useEffect(() => {
    if (listeningRef.current) {
      listeningRef.current = false;
      try { recInstance?.stop(); } catch { /* ignore */ }
      setIsListening(false);
      setInterim('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listeningRef.current = false;
      if (recInstance) {
        recInstance.onresult = null;
        recInstance.onerror  = null;
        recInstance.onend    = null;
        try { recInstance.abort(); } catch { /* ignore */ }
        recInstance = null;
      }
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────
  const saveToHistory = () => {
    const text = transcript.trim();
    if (!text) return;
    const entry = { id: Date.now(), text, date: new Date().toLocaleString(), lang };
    const next  = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem('vscribe-history', JSON.stringify(next));
  };

  const copyText = async () => {
    const text = transcript.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const clearTranscript = () => {
    finalTextRef.current = '';
    setTranscript('');
    setInterim('');
    setError('');
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo">🎙️</span>
          <h1 className="app-title">VoiceScribe</h1>
        </div>
        <button
          className="icon-btn"
          onClick={() => setShowHistory((v) => !v)}
          aria-label="Toggle history"
          title="History"
        >
          📋
        </button>
      </header>

      {/* History panel */}
      {showHistory && (
        <aside className="history-panel">
          <div className="history-header">
            <h2>History</h2>
            <button className="text-btn" onClick={() => {
              setHistory([]);
              localStorage.removeItem('vscribe-history');
            }}>Clear all</button>
          </div>
          {history.length === 0 ? (
            <p className="empty-msg">No saved transcripts yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item" onClick={() => {
                  setTranscript(item.text);
                  setShowHistory(false);
                }}>
                  <p className="history-text">
                    {item.text.slice(0, 80)}{item.text.length > 80 ? '…' : ''}
                  </p>
                  <span className="history-date">{item.date}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      <main className="main">
        {/* Language */}
        <div className="lang-row">
          <label htmlFor="lang-select" className="lang-label">Language</label>
          <select
            id="lang-select"
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {!supported && (
          <div className="banner error">
            ⚠️ Web Speech API is not supported in this browser. Try Chrome or Edge.
          </div>
        )}

        {error && (
          <div className="banner error" role="alert">⚠️ {error}</div>
        )}

        {/* Status */}
        <div className={`status-bar ${isListening ? 'active' : ''}`}>
          <span className={`status-dot ${isListening ? 'active' : ''}`} />
          <span>{isListening ? 'Listening…' : 'Tap the mic to start'}</span>
        </div>

        {/* Transcript */}
        <div className="transcript-wrapper">
          <textarea
            className="transcript-area"
            value={transcript + interim}
            onChange={(e) => {
              finalTextRef.current = e.target.value;
              setTranscript(e.target.value);
              setInterim('');
            }}
            placeholder="Your transcription will appear here…"
            aria-label="Transcription text"
          />
          {interim && <div className="interim-badge">interim</div>}
        </div>

        {/* Stats */}
        <div className="stats">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>

        {/* Mic */}
        <div className="mic-row">
          <MicButton
            isListening={isListening}
            onClick={toggleListening}
            disabled={!supported}
          />
        </div>

        {/* Actions */}
        <div className="action-row">
          <button
            className="action-btn secondary"
            onClick={clearTranscript}
            disabled={!transcript && !interim}
          >
            🗑️ Clear
          </button>
          <button
            className="action-btn secondary"
            onClick={copyText}
            disabled={!transcript.trim()}
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button
            className="action-btn primary"
            onClick={saveToHistory}
            disabled={!transcript.trim()}
          >
            💾 Save
          </button>
        </div>
      </main>
    </div>
  );
}
