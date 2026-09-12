import React, { useState, useEffect } from "react";

export default function Notifications() {
  // Initialize from localStorage or fallback to empty array
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("htge_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage whenever notifications change
  const saveNotifications = (updated: any[]) => {
    setNotifications(updated);
    localStorage.setItem("htge_notifications", JSON.stringify(updated));
  };

  // 1. Click single notification to mark as read
  const handleNotificationClick = (id: string | number) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    saveNotifications(updated);
  };

  // 2. Mark all as read button
  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stay updated on project milestones and proposals
            </p>
          </div>
        </div>

        {/* Mark All As Read Button */}
        {unreadCount > 0 ? (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            All caught up
          </span>
        )}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id)}
              className={`p-5 flex items-start gap-4 transition-all duration-150 cursor-pointer ${
                n.unread
                  ? "bg-blue-50/30 hover:bg-blue-50/50"
                  : "bg-white hover:bg-slate-50/70 opacity-80"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  n.unread
                    ? "bg-blue-100 text-blue-600 shadow-xs"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm ${
                      n.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.description}</p>
              </div>

              {/* Blue Unread Dot (disappears once clicked) */}
              {n.unread && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2 ring-4 ring-blue-100 animate-pulse"
                  title="Unread"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}