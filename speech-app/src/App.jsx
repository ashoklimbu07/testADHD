import { useState, useEffect, useRef } from 'react';
import {
  Mic, Square, ClipboardList, Trash2,
  Copy, Save, Globe, ChevronDown,
  AlertTriangle, CheckCheck, Sparkles,
} from 'lucide-react';

// ── Web Speech API ─────────────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = Boolean(SpeechRecognition);
const isMobile  = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let recInstance = null;

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

// ── Mic button ─────────────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
      className={[
        'relative flex items-center justify-center w-20 h-20 rounded-full',
        'transition-all duration-150 active:scale-90 select-none',
        isListening
          ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_6px_28px_rgba(225,29,72,0.35)]'
          : 'bg-gradient-to-br from-violet-600 to-violet-700 shadow-[0_6px_28px_rgba(124,58,237,0.35)]',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110',
      ].join(' ')}
    >
      {isListening && (
        <>
          <span className="pulse-ring absolute inset-0 rounded-full border-2 border-rose-400/60" />
          <span className="pulse-ring-delay absolute inset-0 rounded-full border-2 border-rose-400/40" />
        </>
      )}
      <span className="relative z-10 text-white">
        {isListening
          ? <Square size={28} fill="white" color="white" />
          : <Mic size={28} />}
      </span>
    </button>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [transcript,  setTranscript]  = useState('');
  const [interim,     setInterim]     = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lang,        setLang]        = useState('en-US');
  const [error,       setError]       = useState('');
  const [copied,      setCopied]      = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vscribe-history') || '[]'); }
    catch { return []; }
  });

  const listeningRef = useRef(false);
  const finalTextRef = useRef('');
  const langRef      = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Recognition session ────────────────────────────────────────────────
  const startSession = () => {
    if (recInstance) {
      recInstance.onresult = null;
      recInstance.onerror  = null;
      recInstance.onend    = null;
      try { recInstance.abort(); } catch { /* ignore */ }
      recInstance = null;
    }
    if (!supported || !listeningRef.current) return;

    const rec          = new SpeechRecognition();
    rec.lang           = langRef.current;
    rec.interimResults = true;
    rec.continuous     = !isMobile;

    rec.onresult = (e) => {
      if (isMobile) {
        const r = e.results[e.results.length - 1];
        if (r.isFinal) {
          finalTextRef.current += r[0].transcript + ' ';
          setTranscript(finalTextRef.current);
          setInterim('');
        } else {
          setInterim(r[0].transcript);
        }
      } else {
        let finals = '', interimText = '';
        for (let i = 0; i < e.results.length; i++) {
          e.results[i].isFinal
            ? (finals      += e.results[i][0].transcript + ' ')
            : (interimText  = e.results[i][0].transcript);
        }
        setTranscript(finalTextRef.current + finals);
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      if (e.error === 'network') {
        setError('Network error: requires Chrome or Edge with internet. Brave is not supported.');
        listeningRef.current = false;
        setIsListening(false);
        return;
      }
      const msgs = {
        'not-allowed':            'Microphone access denied.',
        'service-not-allowed':    'Speech service blocked. Use Chrome or Edge.',
        'language-not-supported': 'Selected language is not supported.',
      };
      setError(msgs[e.error] ?? `Speech error: ${e.error}`);
      listeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    rec.onend = () => {
      setInterim('');
      if (!listeningRef.current) { setIsListening(false); return; }
      if (isMobile) {
        setTimeout(() => { if (listeningRef.current) startSession(); }, 80);
      } else {
        setTranscript((cur) => { finalTextRef.current = cur; return cur; });
        setTimeout(() => { if (listeningRef.current) startSession(); }, 100);
      }
    };

    recInstance = rec;
    try { rec.start(); }
    catch {
      setError('Could not start microphone.');
      listeningRef.current = false;
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    setError('');
    if (listeningRef.current) {
      listeningRef.current = false;
      try { recInstance?.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      finalTextRef.current = '';
      setTranscript('');
      setInterim('');
      listeningRef.current = true;
      setIsListening(true);
      startSession();
    }
  };

  useEffect(() => {
    if (listeningRef.current) {
      listeningRef.current = false;
      try { recInstance?.stop(); } catch { /* ignore */ }
      setIsListening(false);
      setInterim('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => () => {
    listeningRef.current = false;
    if (recInstance) {
      recInstance.onresult = null;
      recInstance.onerror  = null;
      recInstance.onend    = null;
      try { recInstance.abort(); } catch { /* ignore */ }
      recInstance = null;
    }
  }, []);

  const saveToHistory = () => {
    const text = transcript.trim();
    if (!text) return;
    const entry = { id: Date.now(), text, date: new Date().toLocaleString(), lang };
    const next  = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem('vscribe-history', JSON.stringify(next));
  };

  const copyText = async () => {
    if (!transcript.trim()) return;
    try {
      await navigator.clipboard.writeText(transcript.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setError('Could not copy to clipboard.'); }
  };

  const clearTranscript = () => {
    finalTextRef.current = '';
    setTranscript('');
    setInterim('');
    setError('');
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-[#faf7f2] overflow-hidden">

      {/* ══ Header ════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-[#e7e0d8] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100">
            <Sparkles size={16} className="text-violet-600" />
          </div>
          <h1 className="text-[1.05rem] font-bold text-[#1c1917] tracking-tight">
            Voice<span className="text-violet-600">Scribe</span>
          </h1>
        </div>
        <button
          onClick={() => setShowHistory(v => !v)}
          aria-label="Toggle history"
          className={[
            'flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200',
            showHistory
              ? 'bg-violet-100 border-violet-300 text-violet-700'
              : 'bg-[#f3ede6] border-[#e7e0d8] text-[#78716c] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200',
          ].join(' ')}
        >
          <ClipboardList size={17} />
        </button>
      </header>

      {/* ══ History drawer ════════════════════════════════════════════════ */}
      {showHistory && (
        <aside className="flex-shrink-0 bg-white border-b border-[#e7e0d8] max-h-[40vh] overflow-y-auto px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
              Saved transcripts
            </span>
            <button
              onClick={() => { setHistory([]); localStorage.removeItem('vscribe-history'); }}
              className="flex items-center gap-1 text-rose-500 text-xs font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-center text-[#78716c] text-sm py-5">Nothing saved yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map(item => (
                <li
                  key={item.id}
                  onClick={() => {
                    finalTextRef.current = item.text;
                    setTranscript(item.text);
                    setShowHistory(false);
                  }}
                  className="bg-[#faf7f2] border border-[#e7e0d8] rounded-xl px-3 py-2.5 cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  <p className="text-[#1c1917] text-sm leading-snug mb-1">
                    {item.text.slice(0, 90)}{item.text.length > 90 ? '…' : ''}
                  </p>
                  <span className="text-[#78716c] text-[0.68rem]">{item.date}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      {/* ══ Scrollable main ═══════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col gap-3 px-4 py-4 overflow-y-auto">

        {/* Language selector */}
        <div className="flex items-center gap-2 bg-white border border-[#e7e0d8] rounded-xl px-3 py-2.5 shadow-sm">
          <Globe size={15} className="text-[#78716c] flex-shrink-0" />
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            aria-label="Select language"
            className="flex-1 bg-transparent text-[#1c1917] text-sm border-none outline-none cursor-pointer appearance-none"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-[#78716c] flex-shrink-0 pointer-events-none" />
        </div>

        {/* Not supported */}
        {!supported && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 text-amber-700 text-sm leading-relaxed">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            Web Speech API is not supported here. Use Chrome or Edge.
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-3 text-rose-700 text-sm leading-relaxed">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Status bar */}
        <div className={[
          'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300',
          isListening
            ? 'bg-teal-50 border-teal-300 text-teal-700'
            : 'bg-white border-[#e7e0d8] text-[#78716c]',
        ].join(' ')}>
          <span className={[
            'w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300',
            isListening ? 'bg-teal-500 shadow-[0_0_6px_rgba(13,148,136,0.5)] blink' : 'bg-[#d6cfc8]',
          ].join(' ')} />
          <span>{isListening ? 'Listening…' : 'Tap the mic to start'}</span>
          {isListening && (
            <span className="ml-auto text-xs font-normal opacity-60">
              {isMobile ? 'mobile' : 'desktop'}
            </span>
          )}
        </div>

        {/* Transcript textarea */}
        <div className="relative flex-1 min-h-40">
          <textarea
            value={transcript + interim}
            onChange={e => {
              finalTextRef.current = e.target.value;
              setTranscript(e.target.value);
              setInterim('');
            }}
            placeholder="Your transcription will appear here…"
            aria-label="Transcription text"
            className="w-full h-full min-h-40 bg-white text-[#1c1917] border border-[#e7e0d8] rounded-2xl px-4 py-3.5 text-base leading-7 resize-none outline-none placeholder-[#a8a29e] shadow-sm focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all duration-200"
          />
          {interim && (
            <span className="absolute bottom-3 right-3 bg-violet-100 text-violet-600 text-[0.62rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full pointer-events-none">
              live
            </span>
          )}
        </div>

        {/* Word / char count */}
        <div className="flex gap-2 justify-end text-[0.72rem] text-[#a8a29e] font-medium">
          <span className="bg-white border border-[#e7e0d8] px-2 py-0.5 rounded-lg">
            {wordCount} words
          </span>
          <span className="bg-white border border-[#e7e0d8] px-2 py-0.5 rounded-lg">
            {transcript.length} chars
          </span>
        </div>

      </main>

      {/* ══ Fixed bottom controls ══════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-t border-[#e7e0d8] px-4 pt-4 pb-6 flex flex-col gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">

        {/* Mic button */}
        <div className="flex justify-center">
          <MicButton
            isListening={isListening}
            onClick={toggleListening}
            disabled={!supported}
          />
        </div>

        {/* Action row */}
        <div className="flex gap-2">

          {/* Clear */}
          <button
            onClick={clearTranscript}
            disabled={!transcript && !interim}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 active:scale-95
              bg-rose-50 text-rose-600 border-rose-200
              hover:bg-rose-100 hover:border-rose-300
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} /> Clear
          </button>

          {/* Copy */}
          <button
            onClick={copyText}
            disabled={!transcript.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 active:scale-95
              bg-[#f3ede6] text-[#44403c] border-[#e7e0d8]
              hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied
              ? <><CheckCheck size={14} className="text-emerald-600" /> Copied!</>
              : <><Copy size={14} /> Copy</>}
          </button>

          {/* Save */}
          <button
            onClick={saveToHistory}
            disabled={!transcript.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white border-none transition-all duration-150 active:scale-95
              bg-gradient-to-r from-violet-600 to-violet-500
              shadow-[0_3px_12px_rgba(124,58,237,0.3)]
              hover:brightness-105
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save size={14} /> Save
          </button>

        </div>
      </div>

    </div>
  );
}
