// ── Web Speech API ─────────────────────────────────────────────────────────
export const SpeechRecognitionCtor =
  window.SpeechRecognition || window.webkitSpeechRecognition;
export const speechSupported = Boolean(SpeechRecognitionCtor);
export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ── Palette (matches the DailyFlow design) ─────────────────────────────────
export const A = '#F2917F';       // accent coral
export const DARK = '#2E3547';
export const MUTED = '#9BA0A8';
export const LIGHT = '#ECE8E2';
export const BG = '#F7F5F1';
export const A_BG = '#FDEEEA';

export const EMOJI_LIST = ['😀', '😍', '😂', '🎉', '💼', '👥', '🧠', '💡', '📚', '🎓', '🏃', '⚽', '🍕', '☕', '🎵', '🎬', '🦷', '🏥', '🚗', '✈️', '🏠', '🎯', '🤝', '⭐'];
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const STORAGE_KEY = 'dailyflow-v2';
