import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function PaymentWallet() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const authUser = JSON.parse(localStorage.getItem("htge_auth_user") || "null");
  const clientId = authUser?.id;

  useEffect(() => {
    if (!clientId) return;
    api.get(`/projects?clientId=${clientId}`)
      .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  const totalSpent = projects.filter(p => ["Completed","COMPLETED"].includes(p.status)).reduce((s,p) => s + (Number(p.budget)||0), 0);
  const inEscrow   = projects.filter(p => ["Ongoing","ONGOING"].includes(p.status)).reduce((s,p) => s + (Number(p.budget)||0), 0);
  const pending    = projects.filter(p => p.status === "Published").reduce((s,p) => s + (Number(p.budget)||0), 0);
  const refunds    = projects.filter(p => {
    if (!["Dropped","DROPPED","DROP_REQUESTED"].includes(p.status)) return false;
    return p.payments?.some((pay: any) => pay.type === "ESCROW");
  });

  const badge: Record<string,{label:string;color:string;bg:string;border:string;dot:string}> = {
    Published: { label:"Pending",    color:"text-blue-700",    bg:"bg-blue-50",    border:"border-blue-200",    dot:"bg-blue-500" },
    ONGOING:   { label:"In Escrow",  color:"text-amber-700",   bg:"bg-amber-50",   border:"border-amber-200",   dot:"bg-amber-500" },
    Ongoing:   { label:"In Escrow",  color:"text-amber-700",   bg:"bg-amber-50",   border:"border-amber-200",   dot:"bg-amber-500" },
    Completed: { label:"Released",   color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500" },
    COMPLETED: { label:"Released",   color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500" },
    DROPPED:   { label:"Dropped",    color:"text-red-700",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500" },
    Dropped:   { label:"Dropped",    color:"text-red-700",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500" },
    DROP_REQUESTED: { label:"Refund Processing", color:"text-purple-700", bg:"bg-purple-50", border:"border-purple-200", dot:"bg-purple-500" },
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><p className="text-sm font-semibold text-slate-500 animate-pulse">Loading wallet...</p></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-white absolute -top-16 -right-16"/>
          <div className="w-40 h-40 rounded-full bg-white absolute bottom-0 left-20"/>
        </div>
        <div className="relative">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">HTGE Client Wallet</p>
          <h1 className="text-3xl font-black tracking-tight">Payment Overview</h1>
          <p className="text-blue-200 text-sm mt-1">Manage your escrow deposits, payments &amp; refunds</p>
        </div>
      </div>

      {/* Refund Alert */}
      {refunds.length > 0 && (
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Refund Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">{refunds.length} project{refunds.length>1?"s":""} ({refunds.map(p=>p.title).join(", ")}) dropped. Escrow amount will be refunded within 5-7 business days.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</p>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">&#8377;{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Across completed projects</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Escrow</p>
          </div>
          <p className="text-2xl font-black text-amber-900 font-mono">&#8377;{inEscrow.toLocaleString()}</p>
          <p className="text-xs text-amber-600 mt-1">Locked for ongoing projects</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Pending</p>
          </div>
          <p className="text-2xl font-black text-blue-900 font-mono">&#8377;{pending.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">Awaiting assignment</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
            <p className="text-xs text-slate-500 mt-0.5">{projects.length} project{projects.length!==1?"s":""}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Razorpay
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-6">#</th>
                <th className="py-3.5 px-6">Project</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length > 0 ? projects.map((p, i) => {
                let s = badge[p.status] || badge["Published"];
                let displayAmount = Number(p.budget) || 0;
                
                // Logic for dropped projects
                if (p.status === "DROPPED" || p.status === "Dropped") {
                  const hasEscrow = p.payments?.some((pay: any) => pay.type === "ESCROW");
                  if (hasEscrow) {
                    displayAmount = displayAmount * 0.90; // 90% refunded
                    s = { ...s, label: "Refunded" };
                  } else {
                    displayAmount = displayAmount * 0.10; // 10% penalty paid
                    s = { ...s, label: "Penalty Paid" };
                  }
                }

                return (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-slate-400">{i+1}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-900">{p.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.id?.slice(0,8)}&#8230;</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{new Date(p.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-black text-slate-900 font-mono">&#8377;{displayAmount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${s.bg} ${s.color} ${s.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-500">No transactions yet</p>
                    <p className="text-xs text-slate-400">Your payment history will appear here</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
