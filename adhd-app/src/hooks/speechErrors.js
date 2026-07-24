export const SPEECH_ERROR_MESSAGES = {
  network: 'Network error: requires Chrome or Edge with internet.',
  'not-allowed': 'Microphone access denied.',
  'audio-capture': 'No microphone found, or another app is using it.',
  'service-not-allowed': 'Speech service blocked. Use Chrome or Edge.',
  'language-not-supported': 'Selected language is not supported.',
};

export const NO_TRANSCRIPT_MESSAGE =
  "No transcript came back from Chrome's speech service. This usually means an ad-blocker/privacy extension or network/VPN is blocking access to Google's speech API — try disabling extensions or an Incognito window.";
