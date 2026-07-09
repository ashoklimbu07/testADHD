import { useState, useEffect, useRef, useCallback } from 'react';
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

  const recognitionRef = useRef(null);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  // ── Setup recognition ────────────────────────────────────────────────────
  const setupRecognition = useCallback(() => {
    if (!supported) return null;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (e) => {
      let interimText = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => prev + finalText + ' ');
      }
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      const msgs = {
        'not-allowed': 'Microphone access denied. Please allow mic permission.',
        'no-speech': 'No speech detected. Try again.',
        network: 'Network error. Check your connection.',
        aborted: '',
      };
      const msg = msgs[e.error] ?? `Error: ${e.error}`;
      if (msg) setError(msg);
      setIsListening(false);
      setInterim('');
    };

    rec.onend = () => {
      setInterim('');
      // Auto-restart if still meant to be listening
      if (recognitionRef.current?._shouldContinue) {
        try { rec.start(); } catch { /* already started */ }
      } else {
        setIsListening(false);
      }
    };

    return rec;
  }, [lang]);

  // ── Toggle listening ─────────────────────────────────────────────────────
  const toggleListening = () => {
    setError('');
    if (isListening) {
      recognitionRef.current._shouldContinue = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const rec = setupRecognition();
      if (!rec) return;
      rec._shouldContinue = true;
      recognitionRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (e) {
        setError('Could not start microphone.');
      }
    }
  };

  // Stop when lang changes
  useEffect(() => {
    if (isListening) {
      recognitionRef.current._shouldContinue = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current._shouldContinue = false;
        recognitionRef.current.stop();
      }
    };
  }, []);

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
