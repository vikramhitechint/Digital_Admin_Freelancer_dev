import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Password reset link sent');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        {/* Card */}
        <div className="bg-white rounded-[20px] p-8 md:p-10 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-7">
            <h2 className="text-[24px] font-extrabold text-[#0F172A] tracking-tight mb-2">Reset Password</h2>
            <p className="text-[14px] text-slate-500 font-normal">
              Enter your admin email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-emerald-900 font-bold text-lg mb-2">Check your inbox</h3>
              <p className="text-emerald-700 text-sm mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <button 
                onClick={() => navigate('/admin/login')}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-4 outline-none transition-all"
                    placeholder="admin@htge.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 text-white text-[14px] font-semibold tracking-wide shadow-sm transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
