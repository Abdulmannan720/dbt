import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
} from '../utils/speech';
import { NextQuestion } from '../types/scheme';

interface VoiceConsoleProps {
  onProcessTranscript: (transcript: string) => void;
  nextQuestion: NextQuestion | null;
  lastExtractedFields: string[];
}

const SAMPLE_UTTERANCES = [
  {
    label: 'Ramesh (Farmer, 41)',
    text: 'I am a 41-year-old farmer from Gaya, Bihar with 1.25 hectares of land and annual income 1.5 lakh',
  },
  {
    label: 'Kamala (Widow, 67)',
    text: 'I am a 67-year-old widow from Madhya Pradesh with no land and annual household income 45,000',
  },
  {
    label: 'Priya (SC Student, 19)',
    text: 'I am a 19-year-old college student from Uttar Pradesh, Scheduled Caste category, family income 1.8 lakh',
  },
  {
    label: 'Sunita (Mother, 28)',
    text: 'I am a 28-year-old woman from Rajasthan, daily wage earner, and family income is 70,000',
  },
  {
    label: 'Correction Turn',
    text: 'Sorry, my actual age is 45 years',
  },
];

export const VoiceConsole: React.FC<VoiceConsoleProps> = ({
  onProcessTranscript,
  nextQuestion,
  lastExtractedFields,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  const toggleListening = () => {
    setErrorMsg(null);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setErrorMsg(
        'Browser Speech Recognition is not supported in this browser. You can type or click the sample spoken sentences below!',
      );
      return;
    }

    try {
      const recognizer = createSpeechRecognizer();
      if (!recognizer) return;

      recognizer.lang = 'en-IN';
      recognitionRef.current = recognizer;

      recognizer.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognizer.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg(
            'Microphone access denied. You can still test easily using the quick spoken sentences below!',
          );
        } else {
          setErrorMsg(`Recognition notice: ${event.error}. You can edit text directly.`);
        }
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognizer.start();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to initialize microphone. Please type or use quick prompts.');
      setIsListening(false);
    }
  };

  const handleApplyTranscript = () => {
    if (!transcript.trim()) return;
    onProcessTranscript(transcript);
  };

  const handleSelectSample = (text: string) => {
    setTranscript(text);
    onProcessTranscript(text);
  };

  const handleSpeakNextQuestion = () => {
    if (!nextQuestion) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakText(nextQuestion.question, 'en-IN', () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Voice Assistant
              <span className="text-xs font-normal text-slate-400">· Conversational Discovery</span>
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          English Voice Recognition (en-IN)
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Next question prompt bar if available */}
        {nextQuestion && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-800 tracking-wide uppercase">
                Assistant Asking · Settles {nextQuestion.settlesSchemeCount} schemes
              </span>
              <p className="text-sm font-bold text-slate-900">
                {nextQuestion.question}
              </p>
              {nextQuestion.hint && (
                <p className="text-xs text-slate-500">
                  Hint: {nextQuestion.hint}
                </p>
              )}
            </div>
            <button
              onClick={handleSpeakNextQuestion}
              className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Question</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mic & Input Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            onClick={toggleListening}
            className={`px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-amber-400" />
                <span>Press to Speak</span>
              </>
            )}
          </button>

          {/* Transcript input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyTranscript()}
              placeholder="e.g. I am a 41-year-old farmer from Bihar with 1.25 ha land..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleApplyTranscript}
            disabled={!transcript.trim()}
            className="px-4 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <span>Interpret</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Quick Simulated Speech Samples */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Click to test sample spoken voice phrases:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_UTTERANCES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample.text)}
                title={sample.text}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-md text-xs text-slate-700 hover:text-amber-900 transition-colors cursor-pointer text-left"
              >
                <span className="font-semibold text-slate-900">{sample.label}: </span>
                <span className="text-slate-600 line-clamp-1 italic">
                  "{sample.text.slice(0, 42)}..."
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Extracted fields indicator banner */}
        {lastExtractedFields.length > 0 && (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Extracted from voice turn:</strong>{' '}
                {lastExtractedFields.join(', ')}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700">
              Deterministic SQL matched immediately
            </span>
          </div>
        )}

        {/* Architecture thesis reminder card */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Strict Architecture Rule:</strong> The natural language model only extracts applicant profile fields. It never sees schemes and <em>never</em> decides eligibility. Eligibility is evaluated deterministically by the SQL matcher so every result is auditable and reproducible.
          </p>
        </div>
      </div>
    </div>
  );
};
