import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      setIsSuccess(true);
      
      setTimeout(() => {
        setSession({
          admin: response.data.user,
          token: response.data.token,
        } as any);
        toast.success('Welcome back to Operations Center');
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Authentication failure: Invalid credentials.');
      toast.error('Authentication failed');
    }
  };

  const handleDemoFill = () => {
    setEmail('adminhtge@gmail.org');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#F7F8FA]">
      {/* LEFT PANE: 40% Width, Dark Navy Brand Universe */}
      <section className="relative w-full md:w-[40%] h-auto md:h-full bg-[#0A0F1E] tech-grid flex flex-col justify-between p-8 md:p-14 overflow-hidden border-r border-slate-800/80 shrink-0">
        {/* Background dynamic glow blobs */}
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>

        {/* Top Badge / Header Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">System Status: Operational</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium hidden lg:inline-block">v4.18.2-prod</span>
        </div>

        {/* Centered Brand Identity & Mission Mandate */}
        <div className="relative z-10 my-auto py-12 flex flex-col items-start max-w-md">
          {/* HTGE Shield Logo & Glow Container */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-lg transition duration-500 group-hover:bg-blue-500/35"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-[#0F172A] border border-blue-500/40 p-2.5 flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10 text-blue-500 drop-shadow-md" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-3">
            HTGE Operations Center
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-sm lg:text-[15px] font-normal leading-relaxed mb-8">
            Secure access for platform administrators only. Orchestrate two-sided talent flows, automated escrow, and project assignments.
          </p>

          {/* Key Security Guarantees & Features */}
          <div className="w-full space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck size={14} />
              </div>
              <span className="text-xs text-slate-300 font-medium">SOC-2 Type II Certified with Zero-Trust Enclave</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-xs text-slate-300 font-medium">Hardware FIDO2 WebAuthn & Multi-Factor Auth</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck size={14} />
              </div>
              <span className="text-xs text-slate-300 font-medium">Direct Telemetry to Global Escrow Ledger</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer on Left Side */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>&copy; 2025 High Tech Global Exchange, Inc.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Security Ops</a>
          </div>
        </div>
      </section>

      {/* RIGHT PANE: 60% Width, Crisp Canvas & Login Card */}
      <main className="w-full md:w-[60%] h-full bg-[#F7F8FA] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Card Container */}
          <div className="bg-white rounded-[20px] p-8 md:p-10 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all">
            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[24px] font-extrabold text-[#0F172A] tracking-tight">Welcome back</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-100">
                  Admin Area
                </span>
              </div>
              <p className="text-[14px] text-slate-500 font-normal">Sign in to your admin account</p>
            </div>

            {/* Alert Notification Box */}
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">Authentication failure:</span> {error}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Field 1: Email */}
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="block text-[13px] font-semibold text-slate-700">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="admin-email"
                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-4 outline-none transition-all`}
                    placeholder="admin@htge.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor="admin-password" className="block text-[13px] font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    className={`block w-full pl-10 pr-11 py-2.5 bg-slate-50 border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-4 outline-none transition-all`}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title="Toggle password view"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-[13px] text-slate-700 font-medium">Remember device</span>
                </label>
                <a href="/admin/forgot-password" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white text-[14px] font-semibold tracking-wide shadow-sm transition-all outline-none ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20'}`}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 size={18} className="text-white" />
                      Redirecting to Console...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Authenticating Enclave...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Interactive Testing Controls */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Testing controls:</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDemoFill} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                  Fill Demo Admin
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-center text-[12px] text-slate-500 font-normal">
              <ShieldCheck size={14} className="text-slate-400 shrink-0" />
              <span>This portal is restricted to authorized personnel.</span>
            </div>
          </div>

          {/* Auxiliary Support Info */}
          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
            <span>Protected by Hardware FIDO2</span>
            <span className="text-slate-300">&bull;</span>
            <a href="#" className="text-slate-600 hover:text-slate-900 font-medium underline-offset-2 hover:underline">Emergency Ops Dispatch</a>
          </div>
        </div>
      </main>
    </div>
  );
}
