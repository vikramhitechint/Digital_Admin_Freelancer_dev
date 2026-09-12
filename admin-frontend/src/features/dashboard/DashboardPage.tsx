import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [chartMode, setChartMode] = useState<'revenue' | 'earnings' | 'commissions'>('revenue');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    awaitingReview: 0,
    activeDisputes: 0,
    pipelineCounts: { pendingReview: 0, ongoing: 0, completed: 0, dropped: 0, total: 0 }
  });

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(res => {
      if (res.data.success) {
        setStats(res.data.data);
      }
    }).catch(console.error);
  }, []);

  const chartPaths = {
    revenue: {
      area: 'M 60 148 C 115 135, 150 160, 185 115 C 220 70, 275 105, 310 92 C 345 80, 400 130, 435 68 C 470 20, 520 75, 560 52 C 600 30, 640 38, 680 25 L 680 200 L 60 200 Z',
      line: 'M 60 148 C 115 135, 150 160, 185 115 C 220 70, 275 105, 310 92 C 345 80, 400 130, 435 68 C 470 20, 520 75, 560 52 C 600 30, 640 38, 680 25'
    },
    earnings: {
      area: 'M 60 165 C 115 155, 150 170, 185 138 C 220 100, 275 125, 310 115 C 345 105, 400 145, 435 95 C 470 50, 520 95, 560 76 C 600 58, 640 65, 680 52 L 680 200 L 60 200 Z',
      line: 'M 60 165 C 115 155, 150 170, 185 138 C 220 100, 275 125, 310 115 C 345 105, 400 145, 435 95 C 470 50, 520 95, 560 76 C 600 58, 640 65, 680 52'
    },
    commissions: {
      area: 'M 60 188 C 115 182, 150 188, 185 178 C 220 165, 275 174, 310 170 C 345 168, 400 180, 435 162 C 470 145, 520 160, 560 152 C 600 144, 640 148, 680 140 L 680 200 L 60 200 Z',
      line: 'M 60 188 C 115 182, 150 188, 185 178 C 220 165, 275 174, 310 170 C 345 168, 400 180, 435 162 C 470 145, 520 160, 560 152 C 600 144, 640 148, 680 140'
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Page Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">Platform Operations Dashboard</h1>
            <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Escrow Stream
            </span>
          </div>
          <p className="text-[13px] text-slate-500 mt-1">Real-time marketplace telemetry, milestone approvals, and entity triage.</p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Sep 01, 2026 - Sep 11, 2026</span>
              <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {/* Dropdown Menu (Hidden by default, shown on hover/focus) */}
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2 space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition font-medium">Today</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition font-medium">Yesterday</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 font-bold transition">Last 7 Days</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition font-medium">Last 30 Days</button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition font-medium">This Month</button>
                <div className="border-t border-slate-100 my-1"></div>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition font-medium">Custom Range...</button>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[13px] font-semibold shadow-sm transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export Audit
          </button>
        </div>
      </div>

      {/* SECTION 1 — KPI CARDS (4 COLUMNS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="stat-card bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <span className="text-base">💰</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight font-mono">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                +18% this month ↑
              </span>
              <span className="text-[11px] text-slate-400">vs. ₹20.6L prev</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[78%]"></div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Pending Payouts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <span className="text-base">⏳</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight font-mono">₹{stats.pendingPayouts.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px]">
                8 requests
              </span>
              <span className="text-[11px] text-slate-400">awaiting release auth</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[45%]"></div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Awaiting Review</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <span className="text-base">📋</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight font-mono">{stats.awaitingReview} Projects</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                5 urgent
              </span>
              <span className="text-[11px] text-slate-400">&lt; 4h turnaround</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full w-[60%]"></div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Active Disputes</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
              <span className="text-base">⚠️</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight font-mono">{stats.activeDisputes} Open</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="badge-pill bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-[11px]">
                1 critical
              </span>
              <span className="text-[11px] text-slate-400">Escrow hold ₹1.15L</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-[25%]"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — CHARTS (65% AREA CHART | 35% PIPELINE DONUT) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-slate-900">Platform Revenue</h3>
                  <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">6-Mo Telemetry</span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">Aggregated gross transaction volume across enterprise contracts</p>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-[12px] font-semibold">
                <button onClick={() => setChartMode('revenue')} className={`px-3 py-1 rounded transition-all ${chartMode === 'revenue' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Revenue</button>
                <button onClick={() => setChartMode('earnings')} className={`px-3 py-1 rounded transition-all ${chartMode === 'earnings' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Earnings</button>
                <button onClick={() => setChartMode('commissions')} className={`px-3 py-1 rounded transition-all ${chartMode === 'commissions' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Commissions</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 my-4 py-2 px-3 bg-[#F8FAFC] rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Month</span>
                <div className="text-[14px] font-bold text-slate-800 font-mono">₹24,35,000 <span className="text-[11px] font-normal text-emerald-600">(Jun)</span></div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Avg</span>
                <div className="text-[14px] font-bold text-slate-800 font-mono">₹19,72,500</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Take Rate</span>
                <div className="text-[14px] font-bold text-blue-600 font-mono">14.8% <span className="text-[11px] font-normal text-slate-400">blended</span></div>
              </div>
            </div>

            <div className="relative w-full h-[250px] mt-2 group">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 230" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35"/>
                    <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="70%" stopColor="#6366F1"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                  </linearGradient>
                </defs>

                <line x1="40" y1="20" x2="690" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="40" y1="65" x2="690" y2="65" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="40" y1="110" x2="690" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="40" y1="155" x2="690" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="40" y1="200" x2="690" y2="200" stroke="#E2E8F0" strokeWidth="1"/>

                <text x="5" y="24" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">₹25L</text>
                <text x="5" y="69" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">₹20L</text>
                <text x="5" y="114" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">₹15L</text>
                <text x="5" y="159" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">₹10L</text>
                <text x="5" y="204" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">₹0L</text>

                <path d={chartPaths[chartMode].area} fill="url(#areaGradient)" className="transition-all duration-500 ease-in-out"/>
                <path d={chartPaths[chartMode].line} fill="none" stroke="url(#strokeGradient)" strokeWidth="3.5" strokeLinecap="round" className="transition-all duration-500 ease-in-out"/>

                <circle cx="60" cy="148" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5"/>
                <circle cx="185" cy="115" r="4.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5"/>
                <circle cx="310" cy="92" r="4.5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5"/>
                <circle cx="435" cy="68" r="4.5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5"/>
                <circle cx="560" cy="52" r="4.5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5"/>
                <circle cx="680" cy="25" r="8" fill="#8B5CF6" fillOpacity="0.25"/>
                <circle cx="680" cy="25" r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2"/>
              </svg>

              <div className="absolute right-4 top-0 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg border border-slate-700 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[10px] text-slate-400 font-sans font-medium">June 2025 (MTD)</div>
                <div className="font-bold text-emerald-400 text-[13px]">₹24,35,000</div>
              </div>
            </div>

            <div className="flex justify-between pl-14 pr-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              <span>Jan 2025</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span className="text-blue-600 font-extrabold">Jun (Current)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pipeline Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-[14px] border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Project Pipeline</h3>
                <p className="text-[12px] text-slate-500">Live operational lifecycle breakdown</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{stats.pipelineCounts.total} Total</span>
            </div>

            <div className="relative flex items-center justify-center py-4">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="12"/>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray="42.9 195.8" strokeDashoffset="0" className="hover:strokeWidth-[14] transition-all cursor-pointer"/>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="12" strokeDasharray="62.0 176.7" strokeDashoffset="-42.9" className="hover:strokeWidth-[14] transition-all cursor-pointer"/>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6366F1" strokeWidth="12" strokeDasharray="81.1 157.6" strokeDashoffset="-104.9" className="hover:strokeWidth-[14] transition-all cursor-pointer"/>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#14B8A6" strokeWidth="12" strokeDasharray="38.2 200.5" strokeDashoffset="-186.0" className="hover:strokeWidth-[14] transition-all cursor-pointer"/>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="12" strokeDasharray="14.3 224.4" strokeDashoffset="-224.2" className="hover:strokeWidth-[14] transition-all cursor-pointer"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[24px] font-extrabold text-slate-900 font-mono leading-none">{stats.pipelineCounts.total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Projects</span>
              </div>
            </div>

            <div className="space-y-2 text-[12px] font-medium pt-1">
              <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-700">Pending Brief Review</span></div>
                <div className="flex items-center gap-2 font-mono"><span className="font-bold text-slate-900">{stats.pipelineCounts.pendingReview}</span></div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-slate-700">Assigned / Dispatched</span></div>
                <div className="flex items-center gap-2 font-mono"><span className="font-bold text-slate-900">0</span></div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span className="text-slate-700">Ongoing Milestone Work</span></div>
                <div className="flex items-center gap-2 font-mono"><span className="font-bold text-slate-900">{stats.pipelineCounts.ongoing}</span></div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span><span className="text-slate-700">Completed & Settled</span></div>
                <div className="flex items-center gap-2 font-mono"><span className="font-bold text-slate-900">{stats.pipelineCounts.completed}</span></div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-slate-700">Dropped / Cancelled</span></div>
                <div className="flex items-center gap-2 font-mono"><span className="font-bold text-slate-900">{stats.pipelineCounts.dropped}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
