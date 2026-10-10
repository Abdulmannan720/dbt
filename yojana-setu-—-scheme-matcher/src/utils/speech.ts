// Speech recognition and speech synthesis helper

export interface SpeechRecognitionHook {
  isSupported: boolean;
  startListening: (
    language: 'en-IN' | 'en-US',
    onResult: (transcript: string) => void,
    onError: (err: string) => void,
    onEnd: () => void,
  ) => void;
  stopListening: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function createSpeechRecognizer() {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  return recognition;
}

export function speakText(
  text: string,
  lang: 'en-IN' | 'en-US' = 'en-IN',
  onFinish?: () => void,
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onFinish) onFinish();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) =>
      (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) &&
      (v.name.includes('India') || v.name.includes('English') || v.name.includes('Natural')),
  );
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onend = () => {
    if (onFinish) onFinish();
  };

  utterance.onerror = () => {
    if (onFinish) onFinish();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
