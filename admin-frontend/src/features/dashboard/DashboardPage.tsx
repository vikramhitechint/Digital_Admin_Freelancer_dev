import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, ArrowRightCircle } from 'lucide-react';
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
  const [allProjects, setAllProjects] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(res => {
      if (res.data.success) setStats(res.data.data);
    }).catch(console.error);
    // Fetch all projects for dynamic chart
    api.get('/projects').then(res => {
      setAllProjects(Array.isArray(res.data) ? res.data : []);
    }).catch(console.error);
  }, []);

  // Build last 6 months of revenue data from real projects
  const chartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        label: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
        year: d.getFullYear(),
        month: d.getMonth(),
        value: 0
      };
    });
    allProjects.forEach(p => {
      const d = new Date(p.createdAt);
      const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (idx >= 0) {
        const budget = Number(p.budget) || 0;
        const factor = chartMode === 'earnings' ? 0.85 : chartMode === 'commissions' ? 0.15 : 1;
        months[idx].value += budget * factor;
      }
    });
    return months;
  }, [allProjects, chartMode]);

  const maxVal = Math.max(...chartData.map(m => m.value), 1);
  const peakMonth = chartData.reduce((a, b) => b.value > a.value ? b : a, chartData[0]);
  const avgVal = chartData.reduce((s, m) => s + m.value, 0) / (chartData.length || 1);

  const formatAmount = (v: number) => {
    if (v >= 100000) return `₹${(v/100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v/1000).toFixed(0)}K`;
    return `₹${v.toFixed(0)}`;
  };

  // Generate Recent Notifications from projects
  const recentNotifications = useMemo(() => {
    const notifyProjects = allProjects
      .filter(p => ['COMPLETED', 'DROP_REQUESTED', 'DROPPED'].includes(p.status))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6); // Take top 6

    return notifyProjects.map(p => {
      if (p.status === 'COMPLETED') {
        return {
          id: p.id,
          type: 'success',
          title: 'Funds released from escrow securely',
          desc: `Project "${p.title}" completed. Payout of ₹${Number(p.budget).toLocaleString()} settled.`,
          time: new Date(p.updatedAt).toLocaleString(),
          icon: CheckCircle
        };
      } else if (p.status === 'DROP_REQUESTED') {
        return {
          id: p.id,
          type: 'warning',
          title: 'Refund Request Pending',
          desc: `Client requested drop for "${p.title}". Awaiting Admin review.`,
          time: new Date(p.updatedAt).toLocaleString(),
          icon: AlertCircle
        };
      } else {
        return {
          id: p.id,
          type: 'danger',
          title: 'Project Dropped & Refund Processed',
          desc: `Project "${p.title}" dropped. Escrow funds refunded or penalized.`,
          time: new Date(p.updatedAt).toLocaleString(),
          icon: ArrowRightCircle
        };
      }
    });
  }, [allProjects]);


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
                <div className="text-[14px] font-bold text-slate-800 font-mono">
                  {formatAmount(peakMonth?.value || 0)}{' '}
                  <span className="text-[11px] font-normal text-emerald-600">({peakMonth?.label})</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Avg</span>
                <div className="text-[14px] font-bold text-slate-800 font-mono">{formatAmount(avgVal)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Take Rate</span>
                <div className="text-[14px] font-bold text-blue-600 font-mono">14.8% <span className="text-[11px] font-normal text-slate-400">blended</span></div>
              </div>
            </div>

            <div className="relative w-full h-[250px] mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 230" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="100%" stopColor="#2563EB"/>
                  </linearGradient>
                  <linearGradient id="barEmpty" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E2E8F0"/>
                    <stop offset="100%" stopColor="#CBD5E1"/>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[20, 65, 110, 155, 200].map((y, i) => (
                  <line key={i} x1="40" y1={y} x2="690" y2={y} stroke={y===200?"#E2E8F0":"#F1F5F9"} strokeWidth="1" strokeDasharray={y===200?"0":"4 4"}/>
                ))}

                {/* Y-Axis Labels */}
                {[maxVal, maxVal*0.75, maxVal*0.5, maxVal*0.25, 0].map((v, i) => (
                  <text key={i} x="5" y={20 + i*45} fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="500">{formatAmount(v)}</text>
                ))}

                {/* Dynamic Bars */}
                {chartData.map((m, i) => {
                  const chartH = 180; // px between top(20) and baseline(200)
                  const barH = m.value > 0 ? Math.max((m.value / maxVal) * chartH, 6) : 4;
                  const x = 73 + i * 110;
                  const isLast = i === chartData.length - 1;
                  const isPeak = m.label === peakMonth?.label && m.value > 0;
                  return (
                    <g key={i}>
                      <rect
                        x={x} y={200 - barH} width="44" height={barH}
                        fill={m.value > 0 ? (isPeak ? "url(#barGradient)" : "url(#barGradient)") : "url(#barEmpty)"}
                        rx="6"
                        opacity={m.value > 0 ? (isPeak ? 1 : 0.7) : 0.4}
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      <text
                        x={x + 22} y="225"
                        fill={isPeak ? "#2563EB" : "#64748B"}
                        fontSize="11" fontWeight={isPeak ? "800" : "700"}
                        textAnchor="middle" letterSpacing="0.05em"
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
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

      {/* SECTION 3 — RECENT ACTIVITY & NOTIFICATIONS */}
      <section className="bg-white rounded-[14px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <h3 className="text-[15px] font-bold text-slate-900">Recent Notifications & Alerts</h3>
          </div>
        </div>
        <div className="p-0">
          {recentNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    notif.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <notif.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {notif.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-slate-700">You're all caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No recent notifications or alerts to show.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
