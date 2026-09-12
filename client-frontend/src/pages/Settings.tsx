import React, { useState } from "react";

export default function Settings() {
  // Company & Bank Details State
  const [profile, setProfile] = useState({
    companyName: "HTGE Technologies Pvt. Ltd.",
    email: "admin@htge.in",
    phone: "+91 98765 43210",
    website: "https://htge.in",
    taxId: "33AABCT1234F1Z5",
    address: "No. 45, 2nd Avenue, Anna Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "HDFC Bank",
    accountNumber: "50200045678901",
    ifscCode: "HDFC0001234",
    branchName: "Anna Nagar, Chennai",
    accountType: "Current Account",
    beneficiaryName: "HTGE Technologies Pvt. Ltd.",
  });

  // Password Reset State
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification Toast Feedback
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const triggerToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordState((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      setIsSavingProfile(false);
      triggerToast("Company profile & Bank details saved successfully!");
    }, 600);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordState.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!passwordState.newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
      triggerToast("Password has been changed successfully!");
    }, 700);
  };

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: "Weak", color: "bg-amber-500" };
    if (score <= 4) return { score: 66, label: "Medium", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(passwordState.newPassword);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border transition-all duration-300 animate-slide-up ${
            toast.type === "success"
              ? "bg-white border-blue-200 text-slate-800 shadow-blue-500/10"
              : "bg-white border-red-200 text-slate-800 shadow-red-500/10"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              toast.type === "success" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {toast.type === "success" ? "Success" : "Error"}
            </p>
            <p className="text-xs text-slate-600">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization profile, bank payout preferences, and account security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            Operational Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Company Profile & Bank Details */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Card 1: Company Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Company Profile</h2>
                    <p className="text-xs text-slate-500">Official business information & contact identity</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  Primary Entity
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                      placeholder="e.g. HTGE Technologies Pvt. Ltd."
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                        placeholder="e.g. admin@htge.in"
                      />
                    </div>
                  </div>

                  {/* Phone & Tax ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={profile.taxId}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Bank Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Bank Details</h2>
                    <p className="text-xs text-slate-500">Designated disbursement and settlement account</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={bankDetails.bankName}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-semibold font-mono rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                      placeholder="e.g. 50200045678901"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-semibold font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>

                  {/* Branch Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={bankDetails.branchName}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                      placeholder="e.g. Anna Nagar, Chennai"
                    />
                  </div>
                </div>

                {/* Account Summary Banner */}
                <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Direct NEFT/RTGS Settlement Account</p>
                    <p>
                      All freelance project milestones and withdrawals will be credited directly to this verified
                      account. Changes will undergo instant verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    "Save profile"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Password Reset Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Password reset</h2>
                  <p className="text-xs text-slate-500">Update your access credentials</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="p-6 space-y-5">
              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordState.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword.current ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordState.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword.new ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength Meter */}
                {passwordState.newPassword && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                      <span>Strength</span>
                      <span className="font-semibold text-slate-700">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordState.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword.confirm ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Password...
                  </>
                ) : (
                  "Change password"
                )}
              </button>
            </form>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Having trouble? Contact support at{" "}
                <a href="mailto:admin@htge.in" className="text-blue-600 font-semibold hover:underline">
                  admin@htge.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}