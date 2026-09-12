import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminShell() {
  return (
    <div className="h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
