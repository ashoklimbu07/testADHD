import { useState, useEffect, useRef } from 'react';
import { SpeechRecognitionCtor, speechSupported, isMobile } from '../constants';
import { SPEECH_ERROR_MESSAGES, NO_TRANSCRIPT_MESSAGE } from './speechErrors';

// Captures live speech via the Web Speech API and exposes the running transcript.
export function useVoiceCapture({ onError } = {}) {
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [listenPhase, setListenPhase] = useState('listen'); // listen | think
  const [micError, setMicError] = useState('');
  const [micReady, setMicReady] = useState(false);

  const listeningRef = useRef(false);
  const finalTextRef = useRef('');
  const recRef = useRef(null);
  const thinkTimerRef = useRef(null);
  const watchdogRef = useRef(null);

  const log = (msg) => console.debug('[speech]', msg);
  const clearWatchdog = () => { if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; } };
  const killRecognizer = () => {
    if (!recRef.current) return;
    recRef.current.onresult = recRef.current.onerror = recRef.current.onend = null;
    try { recRef.current.abort(); } catch { /* ignore */ }
    recRef.current = null;
  };

  useEffect(() => () => {
    listeningRef.current = false;
    killRecognizer();
    if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current);
    clearWatchdog();
  }, []);

  const startSession = () => {
    killRecognizer();
    if (!speechSupported || !listeningRef.current) {
      log(`skipped start (supported=${speechSupported}, listening=${listeningRef.current})`);
      return;
    }

    const rec = new SpeechRecognitionCtor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = !isMobile;

    rec.onstart = () => { log('mic started'); setMicReady(true); };
    rec.onaudiostart = () => log('audio capture started');
    rec.onnomatch = () => log('no match');
    rec.onspeechstart = () => {
      log('speech detected');
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        log('WARNING: no transcript arrived 6s after speech was detected');
        setMicError(NO_TRANSCRIPT_MESSAGE);
      }, 6000);
    };
    rec.onsoundstart = () => log('sound detected');

    rec.onresult = (e) => {
      clearWatchdog();
      log(`onresult (${e.results.length} result(s), resultIndex=${e.resultIndex})`);
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
            ? (finals += e.results[i][0].transcript + ' ')
            : (interimText = e.results[i][0].transcript);
        }
        setTranscript(finalTextRef.current + finals);
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      clearWatchdog();
      log(`ERROR: ${e.error}`);
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      setMicError(SPEECH_ERROR_MESSAGES[e.error] ?? `Speech error: ${e.error}`);
      listeningRef.current = false;
      setInterim('');
      onError?.();
    };

    rec.onend = () => {
      clearWatchdog();
      log('ended');
      setInterim('');
      if (!listeningRef.current) return;
      setTranscript((cur) => { finalTextRef.current = cur; return cur; });
      setTimeout(() => { if (listeningRef.current) startSession(); }, 100);
    };

    recRef.current = rec;
    try { rec.start(); }
    catch (err) {
      log(`start() threw: ${err?.message || err}`);
      setMicError('Could not start microphone.');
      listeningRef.current = false;
      onError?.();
    }
  };

  const begin = () => {
    setMicError('');
    setMicReady(false);
    finalTextRef.current = '';
    setTranscript('');
    setInterim('');
    setListenPhase('listen');
    listeningRef.current = true;
    startSession();
  };

  // Stops the mic; calls onFinal(text) after a short "thinking" delay, or onEmpty() if nothing was said.
  const end = (onFinal, onEmpty) => {
    if (listenPhase === 'think') return;
    listeningRef.current = false;
    try { recRef.current?.stop(); } catch { /* ignore */ }
    const finalText = (transcript + ' ' + interim).trim();
    if (!finalText) { onEmpty?.(); return; }
    setListenPhase('think');
    thinkTimerRef.current = setTimeout(() => onFinal(finalText), 1300);
  };

  const typeSubmit = (text, onFinal) => {
    setTranscript(text);
    setInterim('');
    setListenPhase('think');
    thinkTimerRef.current = setTimeout(() => onFinal(text), 1000);
  };

  const liveTranscript = (transcript + (interim ? ' ' + interim : '')).trim();

  return { liveTranscript, listenPhase, micError, micReady, speechSupported, begin, end, typeSubmit };
}
