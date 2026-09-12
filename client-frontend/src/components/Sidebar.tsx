import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Closed by default - only opens when clicked
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const isProjectsActive = location.pathname.includes("/projects");

  const user = {
    name: "HTGE Admin",
    email: "admin@htge.in",
    avatarInitials: "H"
  };

  // Sync unread notification dot
  const checkUnread = () => {
    const saved = localStorage.getItem("htge_notifications");
    const notifications = saved ? JSON.parse(saved) : [];
    setHasUnread(notifications.some((n: any) => n.unread));
  };

  useEffect(() => {
    checkUnread();
    const handleUpdate = () => checkUnread();
    window.addEventListener("htge_notifications_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("htge_notifications_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("htge_auth_user");
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-xs"
        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
    }`;

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? "text-blue-600 font-bold bg-blue-50/80"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Section */}
      <div className="p-5 space-y-6 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            H
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">HTGE Operations</h2>
            <p className="text-[10px] text-slate-400 mt-1">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {/* Dashboard */}
          <NavLink to="/dashboard" className={linkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          {/* ========================================================= */}
          {/* PROJECTS (Closed by default - opens only on click)        */}
          {/* ========================================================= */}
          <div>
            <button
              type="button"
              onClick={() => setProjectsDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isProjectsActive && !projectsDropdownOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Projects</span>
              </div>

              {/* Chevron Arrow */}
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  projectsDropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Sub-items (No dots - clean text links) */}
            {projectsDropdownOpen && (
              <div className="pl-6 pr-2 pt-1 pb-1 space-y-0.5 border-l-2 border-slate-100 ml-5 my-1">
                <NavLink to="/projects/publish" className={subLinkClass}>
                  Publish
                </NavLink>

                <NavLink to="/projects/ongoing" className={subLinkClass}>
                  Ongoing
                </NavLink>

                <NavLink to="/projects/complete" className={subLinkClass}>
                  Complete
                </NavLink>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NavLink to="/notifications" className={linkClass}>
            <div className="relative flex items-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </div>
            <span className="flex-1">Notifications</span>
            {hasUnread && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            )}
          </NavLink>

          {/* Settings */}
          <NavLink to="/settings" className={linkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM: User Card + Logout Button                          */}
      {/* ========================================================= */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
            {user.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}