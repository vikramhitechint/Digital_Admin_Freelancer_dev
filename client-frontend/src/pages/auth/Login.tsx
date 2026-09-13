import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim() || (isRegister && (!fullName.trim() || !companyName.trim()))) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const url = isRegister 
        ? "http://localhost:3000/api/auth/register" 
        : "http://localhost:3000/api/auth/login";
        
      const payload = isRegister
        ? { email: email.trim(), password: password.trim(), fullName: fullName.trim(), role: "CLIENT", profile: { companyName: companyName.trim() } }
        : { email: email.trim(), password: password.trim() };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success -> Save session and token, then redirect
      localStorage.setItem("htge_auth_token", data.token);
      localStorage.setItem(
        "htge_auth_user",
        JSON.stringify({
          ...data.user,
          name: data.user.fullName,
          companyName: data.user.profile?.companyName || "",
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        })
      );

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-7">
        
        {/* Logo Image */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = "flex";
              }
            }}
          />
          <div className="hidden border border-slate-300 rounded px-6 py-2 items-center justify-center">
            <span className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              LOGO
            </span>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegister ? "Create an Account" : "Welcome Back"}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegister ? "Register your company to manage projects" : "Login to manage your projects"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrorMessage(""); }}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  required={isRegister}
                />
              </div>
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setErrorMessage(""); }}
                  placeholder="HTGE Technologies Pvt. Ltd."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  required={isRegister}
                />
              </div>
            </>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="your-email@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{isRegister ? "Registering..." : "Logging in..."}</span>
                </>
              ) : (
                <span>{isRegister ? "Create Account" : "Login"}</span>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-red-500 text-center pt-1 animate-in fade-in duration-200">
              {errorMessage}
            </p>
          )}

          {/* Toggle Login/Register */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setErrorMessage(""); }}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                {isRegister ? "Login here" : "Register your company"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
