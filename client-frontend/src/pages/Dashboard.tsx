import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Project } from "../types";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("All months");
  const [selectedYear, setSelectedYear] = useState("All years");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error);
  }, []);

  const totalPublish = projects.filter(p => p.status === 'PUBLISHED').length;
  const totalOngoing = projects.filter(p => p.status === 'ONGOING').length;
  const totalComplete = projects.filter(p => p.status === 'COMPLETED').length;
  const projectWorth = projects.reduce((acc, p) => acc + Number(p.budget), 0);

  // Simplified donut stats
  const total = projects.length;
  const publishPct = total > 0 ? (totalPublish / total) * 100 : 0;
  const ongoingPct = total > 0 ? (totalOngoing / total) * 100 : 0;
  const completePct = total > 0 ? (totalComplete / total) * 100 : 0;
  
  // Hardcoded categories/freelancers for now since this is just a client overview, 
  // but ideally derived from actual projects.
  const skills = [
    { name: "UI/UX Design", count: 8, percentage: 45, color: "#2563EB" },
    { name: "Frontend Dev", count: 6, percentage: 35, color: "#0D9488" },
    { name: "Backend APIs", count: 4, percentage: 20, color: "#F59E0B" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex justify-end items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FILTER</span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option>All months</option>
          <option>August</option>
          <option>July</option>
          <option>June</option>
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option>All years</option>
          <option>2026</option>
          <option>2025</option>
        </select>
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
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">PROJECT WORTH</p>
          <p className="text-3xl font-bold text-slate-900 mt-3 font-serif">₹{projectWorth.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total investment</p>
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
            {skills.map((skill) => (
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
            ))}
          </div>
        </div>

        {/* Recent Freelancers */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent freelancers</h3>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">IN PROJECTS</span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Empty for now as freelancers are attached to projects, can be derived later */}
            <div className="py-8 text-center text-xs text-slate-500">
              No recent freelancer activity to display.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}