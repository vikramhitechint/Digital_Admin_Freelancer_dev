import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [hasUnread, setHasUnread] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState({
    name: "HTGE Admin",
    email: "admin@htge.in",
    avatarInitials: "H",
    role: "Administrator",
    companyName: ""
  });

  const checkUnread = () => {
    const saved = localStorage.getItem("htge_notifications");
    const notifications = saved ? JSON.parse(saved) : [];
    setHasUnread(notifications.some((n: any) => n.unread));
  };

  const loadUser = () => {
    const saved = localStorage.getItem("htge_auth_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser({
        name: parsed.name || parsed.fullName || "User",
        email: parsed.email || "",
        avatarInitials: (parsed.name || parsed.fullName || "U").charAt(0).toUpperCase(),
        role: "Client",
        companyName: parsed.companyName || ""
      });
    }
  };

  useEffect(() => {
    checkUnread();
    loadUser();

    const handleUpdate = () => checkUnread();
    const handleAuth = () => loadUser();
    
    window.addEventListener("htge_notifications_changed", handleUpdate);
    window.addEventListener("auth-update", handleAuth);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("storage", handleAuth);

    return () => {
      window.removeEventListener("htge_notifications_changed", handleUpdate);
      window.removeEventListener("auth-update", handleAuth);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("storage", handleAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("publish")) return "Projects / Publish";
    if (path.includes("ongoing")) return "Projects / Ongoing";
    if (path.includes("complete")) return "Projects / Complete";
    if (path.includes("notifications")) return "Notifications";
    if (path.includes("settings")) return "Settings";
    if (path.includes("payment-wallet")) return "Payment Wallet";
    return "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("htge_auth_user");
    localStorage.removeItem("htge_auth_token");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {hasUnread && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping opacity-75" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
            </>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
            title="Profile Menu"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
              {user.avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-700 leading-tight">
                {user.companyName || user.name}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">{user.role}</span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
