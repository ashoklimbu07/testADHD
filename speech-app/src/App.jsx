import { useState, useEffect, useRef } from 'react';
import './App.css';

// ── Check browser support ──────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = Boolean(SpeechRecognition);

// ── Mic pulse animation component ─────────────────────────────────────────
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

// ── Language selector ──────────────────────────────────────────────────────
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

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vscribe-history') || '[]');
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  // Single recognition instance, recreated only when lang changes
  const recRef = useRef(null);
  // Ref flag: are we intentionally listening (used inside onend closure)
  const listeningRef = useRef(false);

  // ── Build / rebuild the recognition instance ───────────────────────────
  useEffect(() => {
    if (!supported) return;

    // Tear down any existing instance first
    if (recRef.current) {
      recRef.current.onresult = null;
      recRef.current.onerror = null;
      recRef.current.onend = null;
      try { recRef.current.abort(); } catch { /* ignore */ }
      recRef.current = null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    // ── onresult: called whenever speech is detected ───────────────────
    // e.resultIndex tells us which results are NEW this event.
    // We only accumulate truly final results; interim is shown separately.
    rec.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalChunk += r[0].transcript;
        } else {
          interimChunk += r[0].transcript;
        }
      }

      if (finalChunk) {
        // Append only — functional update avoids stale closure
        setTranscript((prev) => prev + finalChunk + ' ');
      }
      setInterim(interimChunk);
    };

    // ── onerror: surface useful messages, ignore benign ones ──────────
    rec.onerror = (e) => {
      if (e.error === 'aborted') return; // we triggered this ourselves
      const msgs = {
        'not-allowed': 'Microphone access denied. Please allow mic permission.',
        'no-speech': 'No speech detected. Try again.',
        network: 'Network error. Check your connection.',
      };
      setError(msgs[e.error] ?? `Speech error: ${e.error}`);
      listeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    // ── onend: auto-restart only if we're still supposed to be listening
    // This handles the browser ending the session after a pause.
    rec.onend = () => {
      setInterim('');
      if (listeningRef.current) {
        // Small delay avoids a rapid restart loop on some browsers
        setTimeout(() => {
          if (listeningRef.current && recRef.current) {
            try { recRef.current.start(); } catch { /* already started */ }
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recRef.current = rec;

    // Cleanup when lang changes or component unmounts
    return () => {
      listeningRef.current = false;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.abort(); } catch { /* ignore */ }
      recRef.current = null;
    };
  }, [lang]); // ← only recreate when language changes

  // ── Toggle listening ─────────────────────────────────────────────────────
  const toggleListening = () => {
    setError('');
    if (listeningRef.current) {
      // Stop
      listeningRef.current = false;
      try { recRef.current?.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      // Start
      if (!recRef.current) return;
      listeningRef.current = true;
      try {
        recRef.current.start();
        setIsListening(true);
      } catch {
        listeningRef.current = false;
        setError('Could not start microphone.');
      }
    }
  };

  // ── Save to history ──────────────────────────────────────────────────────
  const saveToHistory = () => {
    const text = transcript.trim();
    if (!text) return;
    const entry = { id: Date.now(), text, date: new Date().toLocaleString(), lang };
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem('vscribe-history', JSON.stringify(next));
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
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

  // ── Clear transcript ─────────────────────────────────────────────────────
  const clearTranscript = () => {
    setTranscript('');
    setInterim('');
    setError('');
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  // ── Render ───────────────────────────────────────────────────────────────
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
                  <p className="history-text">{item.text.slice(0, 80)}{item.text.length > 80 ? '…' : ''}</p>
                  <span className="history-date">{item.date}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      <main className="main">
        {/* Language selector */}
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

        {/* Not supported warning */}
        {!supported && (
          <div className="banner error">
            ⚠️ Web Speech API is not supported in this browser. Try Chrome or Edge on Android/desktop.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="banner error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Status indicator */}
        <div className={`status-bar ${isListening ? 'active' : ''}`}>
          <span className={`status-dot ${isListening ? 'active' : ''}`} />
          <span>{isListening ? 'Listening…' : 'Tap the mic to start'}</span>
        </div>

        {/* Transcript box */}
        <div className="transcript-wrapper">
          <textarea
            className="transcript-area"
            value={transcript + (interim ? interim : '')}
            onChange={(e) => {
              // Allow manual editing — strip interim portion
              setTranscript(e.target.value);
              setInterim('');
            }}
            placeholder="Your transcription will appear here…"
            aria-label="Transcription text"
          />
          {interim && (
            <div className="interim-badge">interim</div>
          )}
        </div>

        {/* Stats */}
        <div className="stats">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>

        {/* Mic button */}
        <div className="mic-row">
          <MicButton
            isListening={isListening}
            onClick={toggleListening}
            disabled={!supported}
          />
        </div>

        {/* Action buttons */}
        <div className="action-row">
          <button
            className="action-btn secondary"
            onClick={clearTranscript}
            disabled={!transcript && !interim}
            title="Clear"
          >
            🗑️ Clear
          </button>
          <button
            className="action-btn secondary"
            onClick={copyText}
            disabled={!transcript.trim()}
            title="Copy"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button
            className="action-btn primary"
            onClick={saveToHistory}
            disabled={!transcript.trim()}
            title="Save"
          >
            💾 Save
          </button>
        </div>
      </main>
    </div>
  );
}
