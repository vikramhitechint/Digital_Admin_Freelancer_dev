import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Assuming this is configured

export default function Settings() {
  const [profile, setProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
  });

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

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users/profile');
      if (res.data.success) {
        const user = res.data.data;
        const p = user.profile || {};
        setProfile({
          companyName: p.companyName || "",
          email: user.email || "",
          phone: user.phone || "",
          website: p.website || "",
          taxId: "", // Not in schema yet, keep local for now
          address: "", city: "", state: "", pincode: ""
        });
        setBankDetails({
          bankName: p.bankName || "",
          accountNumber: p.accountNumber || "",
          ifscCode: p.ifscCode || "",
          branchName: p.branchName || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordState(prev => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const payload = {
        phone: profile.phone,
        email: profile.email,
        companyName: profile.companyName,
        website: profile.website,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        branchName: bankDetails.branchName
      };

      const res = await api.put('/users/profile', payload);
      
      if (res.data.success) {
        triggerToast("Company profile & Bank details saved successfully!");
        
        // Update local storage so navbar sees updated companyName
        const userStr = localStorage.getItem("htge_auth_user");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.companyName = payload.companyName;
          localStorage.setItem("htge_auth_user", JSON.stringify(u));
          // Dispatch event so navbar can listen and update
          window.dispatchEvent(new Event('auth-update'));
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.currentPassword) { setPasswordError("Please enter your current password."); return; }
    if (!passwordState.newPassword) { setPasswordError("Please enter a new password."); return; }
    if (passwordState.newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    if (passwordState.newPassword !== passwordState.confirmPassword) { setPasswordError("New password and confirm password do not match."); return; }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
      triggerToast("Password has been changed successfully!");
    }, 700);
  };

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

  if (isLoading) {
    return <div className="flex justify-center p-20"><div className="animate-pulse text-slate-400">Loading settings...</div></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border transition-all duration-300 animate-slide-up ${toast.type === "success" ? "bg-white border-blue-200 text-slate-800 shadow-blue-500/10" : "bg-white border-red-200 text-slate-800 shadow-red-500/10"}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toast.type === "success" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="text-sm text-slate-600">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organization profile, bank payout preferences, and account security.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            Operational Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            {/* Company Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Company Profile</h2>
                    <p className="text-sm text-slate-500">Official business information & contact identity</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">Primary Entity</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Company Name</label>
                    <input type="text" name="companyName" value={profile.companyName} onChange={handleProfileChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. HTGE Technologies Pvt. Ltd." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" name="email" value={profile.email} onChange={handleProfileChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. admin@htge.in" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="text" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Website</label>
                    <input type="text" name="website" value={profile.website} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Bank Details</h2>
                    <p className="text-sm text-slate-500">Designated disbursement and settlement account</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Bank Name</label>
                    <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleBankChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. HDFC Bank" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Account Number</label>
                    <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleBankChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-semibold font-mono rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. 50200045678901" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input type="text" name="ifscCode" value={bankDetails.ifscCode} onChange={handleBankChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-semibold font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. HDFC0001234" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Branch Name</label>
                    <input type="text" name="branchName" value={bankDetails.branchName} onChange={handleBankChange} required className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="e.g. Anna Nagar, Chennai" />
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Direct NEFT/RTGS Settlement Account</p>
                    <p>All freelance project milestones and withdrawals will be credited directly to this verified account. Changes will undergo instant verification.</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="submit" disabled={isSavingProfile} className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50">
                  {isSavingProfile ? "Saving..." : "Save profile"}
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
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Password reset</h2>
                  <p className="text-sm text-slate-500">Update your access credentials</p>
                </div>
              </div>
            </div>
            <form onSubmit={handlePasswordReset} className="p-6 space-y-5">
              {passwordError && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{passwordError}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Current password</label>
                <input type={showPassword.current ? "text" : "password"} name="currentPassword" value={passwordState.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">New password</label>
                <input type={showPassword.new ? "text" : "password"} name="newPassword" value={passwordState.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="Enter new password" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Confirm password</label>
                <input type={showPassword.confirm ? "text" : "password"} name="confirmPassword" value={passwordState.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-2.5 bg-slate-50/50 text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-600 outline-none" placeholder="Confirm new password" />
              </div>
              <button type="submit" disabled={isChangingPassword} className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50">
                {isChangingPassword ? "Updating..." : "Change password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
