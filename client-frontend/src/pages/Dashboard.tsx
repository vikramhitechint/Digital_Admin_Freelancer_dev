import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Project } from "../types";

export default function Dashboard() {
  const [selectedMonthStr, setSelectedMonthStr] = useState(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error);
    api.get('/auth/me').then(res => setWalletBalance(Number(res.data.walletBalance) || 0)).catch(console.error);
  }, []);

  // Filter projects based on the selected month
  const filteredProjects = projects.filter(p => {
    if (!selectedMonthStr) return true;
    const pDate = new Date(p.createdAt);
    const m = String(pDate.getMonth() + 1).padStart(2, '0');
    const y = pDate.getFullYear();
    return `${y}-${m}` === selectedMonthStr;
  });

  const totalPublish = filteredProjects.filter(p => p.status === 'PUBLISHED').length;
  const totalOngoing = filteredProjects.filter(p => p.status === 'ONGOING').length;
  const totalComplete = filteredProjects.filter(p => p.status === 'COMPLETED').length;
  const projectWorth = filteredProjects.reduce((acc, p) => acc + Number(p.budget), 0);

  // Simplified donut stats
  const total = filteredProjects.length;
  const publishPct = total > 0 ? (totalPublish / total) * 100 : 0;
  const ongoingPct = total > 0 ? (totalOngoing / total) * 100 : 0;
  const completePct = total > 0 ? (totalComplete / total) * 100 : 0;
  
  // Calculate dynamic skill counts from freelancers in the filtered projects
  const skillCounts: Record<string, number> = {};
  filteredProjects.forEach(p => {
    if (p.freelancers) {
      p.freelancers.forEach((f: any) => {
        const skills = f.freelancer?.profile?.skills || [];
        skills.forEach((s: string) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      });
    }
  });

  const totalSkills = Object.values(skillCounts).reduce((a, b) => a + b, 0);
  const colors = ["#2563EB", "#0D9488", "#F59E0B", "#10B981", "#8B5CF6"];
  const dynamicSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // top 5
    .map(([name, count], idx) => ({
      name,
      count,
      percentage: totalSkills > 0 ? (count / totalSkills) * 100 : 0,
      color: colors[idx % colors.length]
    }));

  // Extract unique freelancers from projects
  const uniqueFreelancers = new Map();
  filteredProjects.forEach(p => {
    if (p.freelancers) {
      p.freelancers.forEach((f: any) => {
        if (!uniqueFreelancers.has(f.freelancer.id)) {
          uniqueFreelancers.set(f.freelancer.id, {
            id: f.freelancer.id,
            name: f.freelancer.fullName,
            title: f.freelancer.role || 'Freelancer',
            avatar: f.freelancer.fullName.charAt(0)
          });
        }
      });
    }
  });
  const recentFreelancersList = Array.from(uniqueFreelancers.values()).slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex justify-end items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FILTER MONTH</span>
        <input
          type="month"
          value={selectedMonthStr}
          onChange={(e) => setSelectedMonthStr(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button 
          onClick={() => setSelectedMonthStr("")} 
          className="text-xs text-slate-500 hover:text-blue-600 transition"
        >
          Clear
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-200 transition-colors">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">TOTAL PUBLISH</p>
          <p className="text-3xl font-bold text-slate-900 mt-3">{totalPublish}</p>
          <p className="text-xs text-slate-500 mt-1">Pending assignment</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-200 transition-colors">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">TOTAL ONGOING</p>
          <p className="text-3xl font-bold text-slate-900 mt-3">{totalOngoing}</p>
          <p className="text-xs text-slate-500 mt-1">Active projects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-200 transition-colors">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">TOTAL COMPLETE</p>
          <p className="text-3xl font-bold text-slate-900 mt-3">{totalComplete}</p>
          <p className="text-xs text-slate-500 mt-1">Successfully delivered</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-200 transition-colors">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">TOTAL SPENT (WALLET)</p>
          <p className="text-3xl font-bold text-slate-900 mt-3 font-serif">₹{walletBalance.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total investment on platform</p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900">Distribution</h3>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ALL PROJECTS</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray={`${publishPct} 100`} strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0284C7" strokeWidth="4.5" strokeDasharray={`${ongoingPct} 100`} strokeDashoffset={`-${publishPct}`} />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0D9488" strokeWidth="4.5" strokeDasharray={`${completePct} 100`} strokeDashoffset={`-${publishPct + ongoingPct}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900 font-serif">{total}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">total</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-600"></span>
                  <span className="text-slate-600 font-medium">Publish</span>
                </div>
                <span className="font-bold text-slate-800">{totalPublish}</span>
              </div>
              <div className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-sky-600"></span>
                  <span className="text-slate-600 font-medium">Ongoing</span>
                </div>
                <span className="font-bold text-slate-800">{totalOngoing}</span>
              </div>
              <div className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-600"></span>
                  <span className="text-slate-600 font-medium">Complete</span>
                </div>
                <span className="font-bold text-slate-800">{totalComplete}</span>
              </div>
            </div>
          </div>
        </div>

        {/* By Skill Category */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-6">By skill category</h3>
          <div className="space-y-4 my-auto">
            {dynamicSkills.length > 0 ? dynamicSkills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{skill.name}</span>
                  <span className="font-bold text-slate-800">{skill.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.percentage}%`, backgroundColor: skill.color }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No skill data available.
              </div>
            )}
          </div>
        </div>

        {/* Recent Freelancers */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent freelancers</h3>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">IN PROJECTS</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentFreelancersList.length > 0 ? recentFreelancersList.map(f => (
              <div key={f.id} className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {f.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-500">{f.title}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent freelancer activity to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}