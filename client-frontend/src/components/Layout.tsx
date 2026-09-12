import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Left Sidebar Frame */}
      <Sidebar/>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar/>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}