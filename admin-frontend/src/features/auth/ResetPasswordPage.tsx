import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Password updated successfully');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-[20px] p-8 md:p-10 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-7">
            <h2 className="text-[24px] font-extrabold text-[#0F172A] tracking-tight mb-2">Create New Password</h2>
            <p className="text-[14px] text-slate-500 font-normal">
              Your new password must be unique and at least 8 characters long.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-emerald-900 font-bold text-lg mb-2">Password Reset Complete</h3>
              <p className="text-emerald-700 text-sm mb-6">
                You can now log in using your new credentials.
              </p>
              <button 
                onClick={() => navigate('/admin/login')}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-4 outline-none transition-all"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-4 outline-none transition-all"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
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
