import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  UserCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  ChevronRight,
  LogOut,
  IndianRupee,
  Clock,
  Volume2,
} from 'lucide-react';
import { ApplicantProfile } from '../types/scheme';

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: 'citizen' | 'operator';
  aadhaarNumber: string;
  mobile: string;
  bankName: string;
  accountNumberMasked: string;
  npciStatus: 'Active & Mapped' | 'Pending Verification';
  totalBenefitsReceived: number;
  recentCredits: Array<{
    id: string;
    schemeName: string;
    amount: string;
    date: string;
    utrNumber: string;
    status: 'Credited' | 'Processing';
  }>;
  profile: ApplicantProfile;
}

const DEMO_USERS: Record<string, AuthenticatedUser> = {
  kamala: {
    id: 'usr-kamala-67',
    name: 'Kamala Devi',
    role: 'citizen',
    aadhaarNumber: '2341 5678 9012',
    mobile: '9876543210',
    bankName: 'State Bank of India (Bhopal Rural Branch)',
    accountNumberMasked: '•••• •••• 4921',
    npciStatus: 'Active & Mapped',
    totalBenefitsReceived: 28400,
    recentCredits: [
      {
        id: 'tx-1',
        schemeName: 'Indira Gandhi National Widow Pension (IGNWPS)',
        amount: '₹1,000',
        date: '2026-09-01',
        utrNumber: 'DBT-RBI-20260901-449102',
        status: 'Credited',
      },
      {
        id: 'tx-2',
        schemeName: 'PM Garib Kalyan Anna DBT Support',
        amount: '₹450',
        date: '2026-08-15',
        utrNumber: 'DBT-RBI-20260815-102948',
        status: 'Credited',
      },
      {
        id: 'tx-3',
        schemeName: 'Old Age Pension Monthly Disbursal',
        amount: '₹1,000',
        date: '2026-08-01',
        utrNumber: 'DBT-RBI-20260801-994012',
        status: 'Credited',
      },
    ],
    profile: {
      age: 67,
      gender: 'FEMALE',
      state: 'Madhya Pradesh',
      socialCategory: 'SC',
      occupation: 'UNEMPLOYED',
      annualIncome: 18000,
      landHolding: 0,
      isStudent: false,
      hasDisability: false,
      isWidow: true,
      isBPL: true,
    },
  },
  rajesh: {
    id: 'usr-rajesh-42',
    name: 'Rajesh Kumar Patel',
    role: 'citizen',
    aadhaarNumber: '8765 4321 0987',
    mobile: '9812345678',
    bankName: 'Bank of Baroda (Rewa Krishi Branch)',
    accountNumberMasked: '•••• •••• 8832',
    npciStatus: 'Active & Mapped',
    totalBenefitsReceived: 36000,
    recentCredits: [
      {
        id: 'tx-4',
        schemeName: 'PM-KISAN Samman Nidhi (17th Installment)',
        amount: '₹2,000',
        date: '2026-08-20',
        utrNumber: 'DBT-RBI-20260820-883109',
        status: 'Credited',
      },
      {
        id: 'tx-5',
        schemeName: 'PM Fasal Bima Claim Compensation',
        amount: '₹14,500',
        date: '2026-07-11',
        utrNumber: 'DBT-RBI-20260711-309114',
        status: 'Credited',
      },
    ],
    profile: {
      age: 42,
      gender: 'MALE',
      state: 'Madhya Pradesh',
      socialCategory: 'OBC',
      occupation: 'FARMER',
      annualIncome: 85000,
      landHolding: 1.5,
      isStudent: false,
      hasDisability: false,
      isWidow: false,
      isBPL: true,
    },
  },
  operator: {
    id: 'usr-csc-operator-01',
    name: 'Suresh Verma (CSC VLE Operator)',
    role: 'operator',
    aadhaarNumber: '5544 3322 1100',
    mobile: '9900112233',
    bankName: 'Punjab National Bank (CSC Merchant Account)',
    accountNumberMasked: '•••• •••• 1204',
    npciStatus: 'Active & Mapped',
    totalBenefitsReceived: 0,
    recentCredits: [],
    profile: {
      age: 34,
      gender: 'MALE',
      state: 'Madhya Pradesh',
      socialCategory: 'GENERAL',
      occupation: 'SELF_EMPLOYED',
      annualIncome: 240000,
      landHolding: 0,
      isStudent: false,
      hasDisability: false,
      isWidow: false,
      isBPL: false,
    },
  },
};

interface LoginPageProps {
  currentUser: AuthenticatedUser | null;
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onLogout: () => void;
  onGoToMatcher: (profile?: ApplicantProfile, name?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onGoToMatcher,
}) => {
  const [activeTab, setActiveTab] = useState<'aadhaar' | 'mobile'>('aadhaar');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState<boolean | null>(null);
  const [isSpinningCaptcha, setIsSpinningCaptcha] = useState(false);

  // Form submission & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [resetMobile, setResetMobile] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random 5-char alphanumeric captcha
  const generateCaptcha = () => {
    setIsSpinningCaptcha(true);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setIsCaptchaValid(null);
    setTimeout(() => setIsSpinningCaptcha(false), 300);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Draw captcha with realistic security distortions and noise
  useEffect(() => {
    if (!canvasRef.current || !captchaCode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Textured background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = ['#cbd5e1', '#94a3b8', '#e2e8f0'][i % 3];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#94a3b8' : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw characters with distinct rotations and fonts
    const charSpacing = canvas.width / (captchaCode.length + 1);
    ctx.textBaseline = 'middle';

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      ctx.save();
      const x = (i + 0.8) * charSpacing;
      const y = canvas.height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      // Colors matching the image (deep charcoal / navy)
      ctx.fillStyle = ['#0f172a', '#1e293b', '#334155'][i % 3];
      ctx.font = `bold ${22 + Math.floor(Math.random() * 4)}px 'JetBrains Mono', 'Courier New', monospace`;
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  // Handle OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Real-time Captcha validation check
  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCaptchaInput(val);
    if (val.length === captchaCode.length) {
      setIsCaptchaValid(val === captchaCode);
    } else {
      setIsCaptchaValid(null);
    }
  };

  // Format Aadhaar automatically as 4-4-4
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\s+/g, '');
    if (/^\d+$/.test(raw) || raw === '') {
      // Numerical format
      raw = raw.slice(0, 12);
      const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
      setIdentifier(formatted);
    } else {
      // General username alphanumeric
      setIdentifier(e.target.value);
    }
    setAuthError(null);
  };

  // Speak captcha for accessibility
  const handleSpeakCaptcha = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = captchaCode.split('').join(' ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send OTP handler
  const handleSendOtp = () => {
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setAuthError(null);
    setOtpSent(true);
    setOtpTimer(30);
    setOtpValues(['7', '8', '4', '2', '9', '1']); // Simulated auto-fill for smooth test experience
  };

  // Quick autofill demo logins
  const handleQuickFill = (presetKey: 'kamala' | 'rajesh' | 'operator') => {
    const user = DEMO_USERS[presetKey];
    if (activeTab === 'aadhaar') {
      setIdentifier(user.aadhaarNumber);
      setPassword('Dbt@2026Gov');
    } else {
      setMobileNumber(user.mobile);
      setOtpSent(true);
      setOtpTimer(30);
      setOtpValues(['7', '8', '4', '2', '9', '1']);
    }
    setCaptchaInput(captchaCode);
    setIsCaptchaValid(true);
    setAuthError(null);
  };

  // Login submission
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Captcha check
    if (captchaInput.toUpperCase() !== captchaCode) {
      setAuthError('Invalid Security Captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    if (activeTab === 'aadhaar') {
      if (!identifier.trim()) {
        setAuthError('Please enter your Aadhaar number or Username.');
        return;
      }
      if (!password) {
        setAuthError('Please enter your password.');
        return;
      }
    } else {
      if (!mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10) {
        setAuthError('Please enter a valid 10-digit mobile number.');
        return;
      }
      const otpStr = otpValues.join('');
      if (otpStr.length !== 6) {
        setAuthError('Please enter the 6-digit OTP received on your mobile.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate real-time UIDAI / DBT Server handshake
    setTimeout(() => {
      setIsLoading(false);
      // Check which demo profile or create dynamic session
      const cleanIdent = identifier.replace(/\s+/g, '');
      let matchedUser: AuthenticatedUser = DEMO_USERS.kamala;

      if (cleanIdent.includes('8765') || mobileNumber.includes('9812')) {
        matchedUser = DEMO_USERS.rajesh;
      } else if (cleanIdent.toLowerCase().includes('csc') || cleanIdent.includes('5544') || mobileNumber.includes('9900')) {
        matchedUser = DEMO_USERS.operator;
      } else {
        matchedUser = DEMO_USERS.kamala;
      }

      setAuthSuccessMsg(`Login Successful! Authenticated as ${matchedUser.name}.`);
      onLoginSuccess(matchedUser);
    }, 700);
  };

  // If already logged in, show the authenticated citizen view
  if (currentUser) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-800/40">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>DBT Seeding Verified · Live Session Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Aadhaar: <strong className="font-mono text-white">{currentUser.aadhaarNumber}</strong></span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Mobile: <strong className="font-mono text-white">+91 {currentUser.mobile}</strong></span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>{currentUser.bankName}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onGoToMatcher(currentUser.profile, currentUser.name)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer group"
              >
                <span>Find Matched Schemes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-rose-950/70 hover:border-rose-700/60 border border-slate-700 text-slate-200 hover:text-rose-200 font-medium rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Details & Direct Benefit Transfer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Bank Seeding */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                NPCI DBT Linkage
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {currentUser.npciStatus}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">
                {currentUser.accountNumberMasked}
              </div>
              <p className="text-xs text-slate-500">
                Direct Benefit Transfer enabled on Bank Account with Aadhaar biometric authorization.
              </p>
            </div>
          </div>

          {/* Card 2: Total Disbursed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total DBT Disbursal
              </span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black font-mono text-emerald-700">
                ₹{currentUser.totalBenefitsReceived.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">
                Directly credited to bank account without intermediaries or processing fee.
              </p>
            </div>
          </div>

          {/* Card 3: Eligible Schemes Available */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Eligible Schemes
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-900">
                Ready for Instant Verification
              </div>
              <p className="text-xs text-slate-500">
                Profile loaded: {currentUser.profile.socialCategory} category, {currentUser.profile.state}.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Credits Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Direct Benefit Transfer Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Real-time transaction settlement log from Reserve Bank of India / PFMS.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Live PFMS Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 font-bold">Scheme Name</th>
                  <th className="py-2.5 font-bold">Amount</th>
                  <th className="py-2.5 font-bold">Credit Date</th>
                  <th className="py-2.5 font-bold">UTR / Reference No.</th>
                  <th className="py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {currentUser.recentCredits.length > 0 ? (
                  currentUser.recentCredits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {item.schemeName}
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-700">
                        {item.amount}
                      </td>
                      <td className="py-3 text-slate-600">
                        {item.date}
                      </td>
                      <td className="py-3 font-mono text-slate-500 text-[11px]">
                        {item.utrNumber}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No recent direct benefit transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Government Emblem & Brand Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Ashoka Emblem & DBT */}
        <div className="flex items-center gap-4">
          {/* Ashoka Lion Emblem Vector */}
          <div className="w-12 h-14 shrink-0 flex flex-col items-center justify-center text-slate-800">
            <svg
              viewBox="0 0 100 120"
              className="w-10 h-12 text-slate-900 fill-current"
              aria-label="National Emblem of India"
            >
              <g fill="currentColor">
                {/* Simplified elegant Lion Capital silhouette */}
                <path d="M50 8 C40 8 36 15 36 22 C36 28 42 32 42 36 C38 36 32 38 30 44 C28 50 32 56 38 58 C36 60 34 64 36 68 C38 72 44 74 50 74 C56 74 62 72 64 68 C66 64 64 60 62 58 C68 56 72 50 70 44 C68 38 62 36 58 36 C58 32 64 28 64 22 C64 15 60 8 50 8 Z" opacity="0.9" />
                <circle cx="50" cy="22" r="3" fill="#ffffff" />
                <circle cx="42" cy="46" r="2.5" fill="#ffffff" />
                <circle cx="58" cy="46" r="2.5" fill="#ffffff" />
                {/* Abacus Base with Ashoka Chakra */}
                <rect x="25" y="78" width="50" height="8" rx="2" fill="#0f172a" />
                <circle cx="50" cy="82" r="3.5" fill="#ffffff" />
                {/* Satyameva Jayate base ribbon */}
                <path d="M20 90 L80 90 L75 100 L25 100 Z" fill="#1e293b" />
                <rect x="28" y="103" width="44" height="3" rx="1.5" fill="#0f172a" />
              </g>
            </svg>
            <span className="text-[8px] font-bold tracking-tighter text-slate-700 uppercase -mt-0.5">
              सत्यमेव जयते
            </span>
          </div>

          <div className="h-10 w-px bg-slate-200 hidden sm:block" />

          {/* DBT Direct Benefit Transfer Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-[#0b3b82]">
                DBT
              </span>
              <svg className="w-8 h-6 text-amber-500" viewBox="0 0 40 24" fill="none">
                {/* Saffron & Green swoosh */}
                <path d="M4 18 C14 8, 26 4, 38 4 C32 10, 22 14, 12 18 Z" fill="#f97316" />
                <path d="M8 22 C18 16, 28 14, 38 12 C30 18, 20 22, 10 22 Z" fill="#16a34a" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-[#0b3b82] tracking-tight leading-tight">
                Direct Benefit Transfer
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Transparent &nbsp;|&nbsp; Secure &nbsp;|&nbsp; Accountable
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital India Logo */}
        <div className="flex items-center gap-2.5">
          {/* Digital India emblem */}
          <div className="flex items-center gap-2">
            <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              {/* Peacock spiral feather */}
              <path
                d="M32 14 C22 14, 18 24, 24 34 C28 40, 36 44, 44 38 C50 32, 48 22, 38 20 C30 18, 26 26, 30 32"
                stroke="#0284c7"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="34" cy="24" r="3" fill="#ea580c" />
              <circle cx="38" cy="30" r="2.5" fill="#16a34a" />
            </svg>
            <div className="text-right">
              <div className="text-sm font-extrabold tracking-tight text-[#0c4a6e]">
                Digital India
              </div>
              <div className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">
                Power To Empower
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Hero Information & Visual Infographic (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-sky-50/80 via-white to-blue-50/40 rounded-3xl border border-sky-100 p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          {/* Top Heading Group */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b3b82] tracking-tight leading-tight">
                Dynamic Real Time Direct Benefit Transfer
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-800">
                <span>Right Benefit</span>
                <span className="text-sky-400">➔</span>
                <span>Right Person</span>
                <span className="text-sky-400">➔</span>
                <span>Right Time</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              DBT ensures that government benefits reach the intended citizens directly into their bank accounts, without any middlemen.
            </p>

            {/* 4 Feature Badges with clean circular icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Secure</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Powered by advanced security systems
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Real-Time</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Instant benefit transfer and updates
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Transparent</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    No middlemen, no corruption
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Empowering Citizens</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Direct access to government schemes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Central Flow Graphic: Citizen & Direct Bank Transfer Architecture */}
          <div className="my-6 pt-4 border-t border-sky-100/80">
            <div className="relative bg-gradient-to-b from-sky-50 to-blue-100/60 rounded-2xl p-5 border border-sky-200/80 overflow-hidden">
              {/* Soft India Map SVG Silhouette in Background */}
              <div className="absolute right-4 top-2 opacity-15 pointer-events-none w-56 h-56 text-sky-800">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <path d="M45 5 C52 5 60 12 58 18 C56 22 62 26 65 32 C68 38 65 44 68 50 C70 56 62 65 58 72 C54 78 50 88 48 95 C46 88 42 80 40 70 C35 60 30 52 32 45 C34 38 28 32 30 25 C32 18 38 12 45 5 Z" />
                </svg>
              </div>

              {/* Flow Icons (Farmer, Student, Healthcare, Rupee) */}
              <div className="flex items-center justify-around gap-2 mb-4 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Farmer</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18C5 19.39 8.13 21.18 12 21.18C15.87 21.18 19 19.39 19 17.18V13.18L12 17.09L5 13.18Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Student</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 10.5H13.5V5H10.5V10.5H5V13.5H10.5V19H13.5V13.5H19V10.5Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Health</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Subsidy</span>
                </div>
              </div>

              {/* Animated downward arrows into Bank */}
              <div className="flex justify-center my-1">
                <div className="flex items-center gap-6 text-blue-600 animate-pulse">
                  <span>↓</span>
                  <span>↓</span>
                  <span>↓</span>
                  <span>↓</span>
                </div>
              </div>

              {/* Bank Graphic + Beneficiary Representation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                {/* Beneficiary Card with phone */}
                <div className="bg-white/95 rounded-xl p-3 border border-sky-200/80 shadow-xs flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center shrink-0 overflow-hidden text-amber-800">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">
                      Direct Beneficiary
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      Citizen Mobile Verification
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Zero Middlemen
                    </span>
                  </div>
                </div>

                {/* Bank Building Vector graphic */}
                <div className="bg-[#0b3b82] text-white px-6 py-3.5 rounded-xl shadow-md text-center flex flex-col items-center justify-center w-full sm:w-auto">
                  <Building2 className="w-6 h-6 text-amber-300 mb-0.5" />
                  <span className="text-xs font-black tracking-widest uppercase">
                    BANK
                  </span>
                  <span className="text-[9px] text-sky-200 font-mono">
                    Direct Account Credit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Royal Blue Banner with India Tricolor Ribbon */}
          <div className="mt-auto bg-gradient-to-r from-[#072d68] via-[#0b3b82] to-[#124296] text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-sky-100 italic">
              "Government Schemes for a Stronger India"
            </span>
            {/* Tricolor Ribbon */}
            <div className="flex items-center h-2.5 w-32 rounded-full overflow-hidden shadow-xs shrink-0">
              <div className="h-full w-1/3 bg-[#ff9933]" />
              <div className="h-full w-1/3 bg-white" />
              <div className="h-full w-1/3 bg-[#138808]" />
            </div>
          </div>
        </div>

        {/* Right Column: DBT Portal Login Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          {/* Card Header: Brand Icon & Title */}
          <div className="text-center space-y-2">
            {/* Colorful Logo Emblem */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600" />
                  <div className="w-5 h-5 rounded-full bg-indigo-600 ring-2 ring-white" />
                  <div className="w-4 h-4 rounded-full bg-sky-500" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              DBT Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Login to Access Your Benefits & Unlock Government Schemes
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
              <Lock className="w-3 h-3 text-blue-600" />
              <span>Login Gateway · Unlocks Scheme Matcher & Tools</span>
            </div>
          </div>

          {/* Quick Demo Fill Pills for Testing */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Quick Demo Logins:</span>
              <span className="text-[10px] text-blue-700">1-click test</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('kamala')}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors text-[11px] font-medium cursor-pointer shadow-2xs"
              >
                Kamala (Widow, 67)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('rajesh')}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors text-[11px] font-medium cursor-pointer shadow-2xs"
              >
                Rajesh (Farmer, PM-KISAN)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('operator')}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors text-[11px] font-medium cursor-pointer shadow-2xs"
              >
                CSC Operator
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('aadhaar');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeTab === 'aadhaar'
                    ? 'bg-[#0062d2] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Username / Aadhaar
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('mobile');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeTab === 'mobile'
                    ? 'bg-[#0062d2] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile Number
              </button>
            </div>

            {/* TAB 1: Aadhaar / Username */}
            {activeTab === 'aadhaar' && (
              <div className="space-y-3.5">
                {/* Input 1: Aadhaar Number or Username */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={handleAadhaarChange}
                    placeholder="Enter Aadhaar Number / Username"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-mono"
                    maxLength={19}
                  />
                </div>

                {/* Input 2: Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Mobile Number with OTP */}
            {activeTab === 'mobile' && (
              <div className="space-y-3.5">
                {/* Mobile Input + Send OTP Button */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setMobileNumber(val);
                        }}
                        placeholder="Enter 10-digit Mobile Number"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-mono"
                        maxLength={10}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0 || mobileNumber.length !== 10}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs transition-all whitespace-nowrap active:scale-95 cursor-pointer shadow-xs"
                    >
                      {otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Send OTP'}
                    </button>
                  </div>

                  {otpSent && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>OTP sent to +91 {mobileNumber.slice(0, 5)}••••• (Simulated OTP: <strong>784291</strong>)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* 6-Digit OTP Boxes */}
                {otpSent && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Enter 6-digit Verification OTP:
                    </label>
                    <div className="flex justify-between gap-1.5">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newOtp = [...otpValues];
                            newOtp[idx] = val;
                            setOtpValues(newOtp);
                            if (val && idx < 5) {
                              const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                              nextInput?.focus();
                            }
                          }}
                          className="w-10 h-10 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Captcha Box & Refresh Control */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3">
                {/* Textured Canvas Captcha */}
                <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1 shadow-inner flex-1 h-12">
                  <canvas
                    ref={canvasRef}
                    width={180}
                    height={44}
                    className="w-full h-full object-contain cursor-default select-none"
                  />
                </div>

                {/* Refresh and Speech Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Generate new Captcha"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSpinningCaptcha ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeakCaptcha}
                    className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Read Captcha out loud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Captcha Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={handleCaptchaChange}
                  placeholder="Enter Captcha"
                  maxLength={5}
                  className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-xs uppercase tracking-widest font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    isCaptchaValid === true
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : isCaptchaValid === false
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600'
                  }`}
                />
                {isCaptchaValid === true && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Animated High-Intent Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0062d2] hover:bg-[#0052b3] active:scale-98 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer relative overflow-hidden group"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating via DBT / UIDAI...</span>
                </div>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Actions: Forgot Password & Register */}
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Forgot Password?</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>New User? Register Here</span>
              </button>
            </div>
          </div>

          {/* Bottom Security Assurance Banner */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-sky-950">
                Your data is safe with us
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                We use advanced security measures to protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Reset DBT Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSent(false);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered mobile number or Aadhaar number. A secure OTP will be sent to your UIDAI registered mobile.
            </p>

            {resetSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <div className="font-bold">Password Reset Link Dispatched</div>
                <p>An OTP with reset link has been dispatched to your mobile. For testing, default credentials remain active.</p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter registered Aadhaar or Mobile"
                  value={resetMobile}
                  onChange={(e) => setResetMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  disabled={!resetMobile.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Send Reset OTP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New User Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">New Citizen Registration (DBT Bharat)</h3>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              New citizens can register using their Aadhaar Number linked with their Pradhan Mantri Jan Dhan Yojana (PMJDY) or savings bank account.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Aadhaar Number (UIDAI):</label>
                <input
                  type="text"
                  placeholder="12-digit Aadhaar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  defaultValue="2341 5678 9012"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bank Account Number (For Direct Subsidy):</label>
                <input
                  type="text"
                  placeholder="Account Number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  defaultValue="30910482910"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Bank Branch IFSC:</label>
                <input
                  type="text"
                  placeholder="SBIN0001421"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                  defaultValue="SBIN0001421"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterOpen(false);
                  handleQuickFill('kamala');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Complete Registration & Auto-Fill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
