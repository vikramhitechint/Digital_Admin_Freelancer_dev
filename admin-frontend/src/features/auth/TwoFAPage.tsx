import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ShieldAlert, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function TwoFAPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer states
  const [totalSeconds, setTotalSeconds] = useState(4 * 60 + 32);
  const [resendWait, setResendWait] = useState(45);
  const initialTotal = 5 * 60;

  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    const timer = setInterval(() => {
      setTotalSeconds(s => Math.max(0, s - 1));
      setResendWait(s => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === 5) {
      checkAutoSubmit(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      setError(null);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      setError(null);
      const nextIdx = Math.min(pastedData.length, 5);
      inputRefs.current[nextIdx]?.focus();
      
      if (pastedData.length === 6) {
        checkAutoSubmit(newOtp);
      }
    }
  };

  const checkAutoSubmit = (currentOtp: string[]) => {
    const fullCode = currentOtp.join('');
    if (fullCode.length === 6) {
      triggerVerification(fullCode);
    }
  };

  const triggerVerification = (code: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (code === '000000') {
        setError('Invalid security code. Code expired or mismatched clock skew.');
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        setTimeout(() => {
          setSession({
            admin: { id: 'admin-001', email: 'elena.vance@htge-network.internal', role: 'ADMIN' as any } as any,
            token: 'mock-token',
          } as any);
          toast.success('2FA Verified. Welcome to Mission Control.');
          navigate('/admin/dashboard');
        }, 1000);
      }
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      const firstEmpty = otp.findIndex(val => !val);
      if (firstEmpty !== -1) inputRefs.current[firstEmpty]?.focus();
    } else {
      triggerVerification(fullCode);
    }
  };

  const handleResend = () => {
    if (resendWait === 0) {
      setResendWait(45);
      setTotalSeconds(5 * 60);
      toast.success('A fresh 6-digit TOTP challenge token has been generated.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pct = Math.max((totalSeconds / initialTotal) * 100, 2);

  return (
    <div className="h-full min-h-screen bg-[#F7F8FA] text-[#0F172A] flex flex-col justify-between selection:bg-blue-100 selection:text-blue-700 relative overflow-x-hidden">
      
      {/* Ambient Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.4] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Top Global Nav */}
      <header className="w-full relative z-10 px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]/60 bg-white/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-7 h-7 text-blue-500 rounded-lg shadow-sm bg-white p-1" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">HTGE Ops Center</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">v4.18.2</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-wide uppercase hidden sm:inline-block">Zero-Trust Enclave Active</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">Node: us-east-1a.secure</span>
        </div>
      </header>

      {/* Main Center Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-4">
        
        {/* Background Aura */}
        <div className="absolute w-[440px] h-[440px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow"></div>

        {/* Centered Card */}
        <div className="w-full max-w-[460px] bg-white rounded-[20px] border border-[#E2E8F0] shadow-card p-7 sm:p-9 relative overflow-hidden transition-all duration-300">
          
          {/* Top Decorative Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

          {/* Card Navigation & Header */}
          <div className="flex items-center justify-between mb-5">
            <Link to="/login" className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all group" title="Return to Login">
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold tracking-wide">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>FIDO2 / TOTP LAYER</span>
            </div>
          </div>

          {/* Icon & Headings */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-sm mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
              Two-Factor Authentication
            </h1>
            <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1.5 max-w-[340px]">
              Enter the 6-digit code from your authenticator app (Google Authenticator, 1Password, or YubiKey).
            </p>

            <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Signing in as: <strong className="text-slate-800 font-semibold">elena.vance@htge.in</strong></span>
            </div>
          </div>

          {/* Form */}
          <form className="mt-7" onSubmit={handleSubmit}>
            
            {/* OTP Inputs */}
            <div className="flex items-center justify-between gap-2 sm:gap-2.5">
              {otp.map((digit, index) => (
                <div key={index} className="flex items-center">
                  <input
                    ref={el => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className={`otp-input w-[46px] sm:w-[56px] h-[54px] sm:h-[64px] text-center text-2xl font-bold font-mono outline-none transition-all duration-150 shadow-sm caret-transparent select-none rounded-xl border ${
                      isSuccess ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' :
                      error ? 'border-red-500 bg-red-50/20 shadow-otp-error text-[#0F172A]' :
                      'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 focus:shadow-otp-focus text-[#0F172A]'
                    }`}
                  />
                  {index === 2 && (
                    <div className="text-slate-300 font-bold select-none text-xl hidden sm:block ml-2">-</div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Expiration Timer */}
            <div className="mt-5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Code expires in:</span>
                </div>
                <span className="font-mono font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                  {formatTime(totalSeconds)}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`w-full mt-6 text-white font-bold text-[14px] py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 focus:ring-4 focus:ring-blue-500/25 focus:outline-none ${
                isSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md' 
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1e40af] shadow-btn-primary'
              }`}
            >
              {isSuccess ? (
                <span>Access Authorized ✓</span>
              ) : isLoading ? (
                <>
                  <span>Verifying Token...</span>
                  <Loader2 className="animate-spin h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <span>Verify Identity</span>
                  <ArrowLeft className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform rotate-180" />
                </>
              )}
            </button>

            {/* Resend Link */}
            <div className="mt-5 text-center">
              <p className="text-[13px] text-slate-500">
                Didn't receive a code? 
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={resendWait > 0} 
                  className={`font-semibold transition-colors ml-1 inline-flex items-center ${
                    resendWait > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 underline cursor-pointer'
                  }`}
                >
                  <span>Resend</span>
                  {resendWait > 0 && <span className="text-[11px] font-mono ml-1">(wait {resendWait}s)</span>}
                </button>
              </p>
            </div>
          </form>

          {/* Bottom Note */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-center space-x-2 text-[12px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Hardware WebAuthn FIDO2 keys supported on macOS & Windows</span>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-xs text-slate-500">
          <span className="font-medium text-slate-400">Controls:</span>
          <button type="button" onClick={() => {
            const demo = ['8', '4', '9', '2', '1', '7'];
            setOtp(demo);
            setError(null);
            inputRefs.current[5]?.focus();
          }} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">Fill Valid</button>
          <button type="button" onClick={() => {
            setOtp(['0', '0', '0', '0', '0', '0']);
            triggerVerification('000000');
          }} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">Test Error</button>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full relative z-10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-[#E2E8F0]/60 bg-white/50 backdrop-blur-xs">
        <div>© 2025 High Tech Global Exchange, Inc. Enterprise Identity Protection.</div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-medium">
          <span className="hover:text-slate-800 cursor-pointer">Security Protocol 2.4</span>
          <span>•</span>
          <span className="hover:text-slate-800 cursor-pointer">Emergency Override</span>
          <span>•</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            HSM Cluster Nominal
          </span>
        </div>
      </footer>
    </div>
  );
}
