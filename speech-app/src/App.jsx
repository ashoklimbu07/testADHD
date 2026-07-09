import { useState, useEffect, useRef } from 'react';
import './App.css';

// ── Web Speech API setup ───────────────────────────────────────────────────
// Grabbed once at module level — outside React, so StrictMode double-mount
// cannot create two instances.
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = Boolean(SpeechRecognition);

// The single recognition instance for the entire app lifetime
let recognition = null;

function getRecognition(lang) {
  if (recognition) {
    try { recognition.abort(); } catch { /* ignore */ }
    recognition.onresult = null;
    recognition.onerror  = null;
    recognition.onend    = null;
  }
  if (!supported) return null;
  recognition = new SpeechRecognition();
  recognition.continuous     = true;
  recognition.interimResults = true;
  recognition.lang           = lang;
  return recognition;
}

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
  const [transcript, setTranscript] = useState('');
  const [interim,    setInterim]    = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lang,       setLang]       = useState('en-US');
  const [error,      setError]      = useState('');
  const [copied,     setCopied]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vscribe-history') || '[]'); }
    catch { return []; }
  });

  // listeningRef drives the auto-restart logic inside onend without
  // stale closure issues — it's a ref, not state.
  const listeningRef = useRef(false);

  // ── Wire up recognition handlers whenever lang changes ─────────────────
  useEffect(() => {
    const rec = getRecognition(lang);
    if (!rec) return;

    rec.onresult = (e) => {
      let finalChunk  = '';
      let interimChunk = '';
      // e.resultIndex = first NEW result this event — iterate only new ones
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalChunk += r[0].transcript;
        } else {
          interimChunk += r[0].transcript;
        }
      }
      if (finalChunk) {
        setTranscript((prev) => prev + finalChunk + ' ');
      }
      setInterim(interimChunk);
    };

    rec.onerror = (e) => {
      // 'aborted' fires when we call rec.abort() ourselves — not an error
      if (e.error === 'aborted') return;
      const msgs = {
        'not-allowed': 'Microphone access denied. Please allow mic permission.',
        'no-speech':   'No speech detected. Try again.',
        network:       'Network error. Check your connection.',
      };
      setError(msgs[e.error] ?? `Speech error: ${e.error}`);
      listeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    // onend fires when the browser stops the session (e.g. after silence).
    // If we still want to listen, restart automatically.
    rec.onend = () => {
      setInterim('');
      if (listeningRef.current) {
        setTimeout(() => {
          if (listeningRef.current && recognition) {
            try { recognition.start(); } catch { /* already running */ }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    // Cleanup: nuke handlers so a stale rec can't fire into this component
    return () => {
      rec.onresult = null;
      rec.onerror  = null;
      rec.onend    = null;
    };
  }, [lang]);

  // ── Toggle mic ─────────────────────────────────────────────────────────
  const toggleListening = () => {
    setError('');
    if (listeningRef.current) {
      listeningRef.current = false;
      try { recognition?.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      if (!recognition) return;
      listeningRef.current = true;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        listeningRef.current = false;
        setError('Could not start microphone.');
      }
    }
  };

  // Stop on unmount
  useEffect(() => {
    return () => {
      listeningRef.current = false;
      try { recognition?.stop(); } catch { /* ignore */ }
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────
  const saveToHistory = () => {
    const text = transcript.trim();
    if (!text) return;
    const entry = { id: Date.now(), text, date: new Date().toLocaleString(), lang };
    const next = [entry, ...history].slice(0, 20);
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
