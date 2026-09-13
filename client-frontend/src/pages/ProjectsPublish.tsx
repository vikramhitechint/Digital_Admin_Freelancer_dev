import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PublishProject from "../components/projectpublish/PublishProject";
import DropProject from "../components/projectpublish/DropProject";
import api from "../utils/api";
import { UIProject } from "../types";

export default function ProjectsPublish() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<UIProject[]>([]);
  
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.title,
        amount: `₹${Number(p.budget).toLocaleString()}`,
        approaches: p.freelancers?.length || 0,
        postedDate: new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: p.status
      }));
      setProjects(mapped);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch projects", "error");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter & Pagination States
  const [selectedMonthStr, setSelectedMonthStr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal Control States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [dropProjectTarget, setDropProjectTarget] = useState<UIProject | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Handle Publish New Project
  const handleCreateProject = async (newProject: any) => {
    try {
      // In a real app, clientId would come from auth context
      // Since it's a demo, we will assign it to the first mock client in DB
      const clientsRes = await api.get('/users?role=CLIENT');
      const clientId = clientsRes.data[0]?.id;

      await api.post('/projects', {
        title: newProject.name,
        description: newProject.description || 'No description provided.',
        budget: Number(newProject.amount.replace(/[^0-9.-]+/g,"")),
        timeline: newProject.timeline || 'TBD',
        clientId: clientId
      });
      
      setIsPublishModalOpen(false);
      setCurrentPage(1);
      showToast("New project published successfully!");
      fetchProjects();
    } catch (err) {
      console.error(err);
      showToast("Failed to publish project", "error");
    }
  };

  // Handle Drop Project Confirmation
  const handleConfirmDrop = async (droppedProjectId: string, feeAmount: string | number) => {
    try {
      await api.put(`/projects/${droppedProjectId}/drop`);
      setDropProjectTarget(null);
      showToast(`Drop requested successfully. Awaiting Admin approval for refund processing.`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      showToast("Failed to drop project", "error");
    }
  };

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      if (!selectedMonthStr) return true;
      const d = new Date(item.postedDate);
      if (isNaN(d.getTime())) return true;
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const y = d.getFullYear();
      return `${y}-${m}` === selectedMonthStr;
    });
  }, [projects, selectedMonthStr]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Custom filter state: separate month & year dropdowns
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const smartFilteredProjects = useMemo(() => {
    return projects.filter((item) => {
      if (item.status === "DROPPED" || item.status === "Dropped") return false;
      const d = new Date(item.postedDate);
      if (isNaN(d.getTime())) return true;
      const monthMatch = filterMonth ? d.getMonth() === months.indexOf(filterMonth) : true;
      const yearMatch = filterYear ? d.getFullYear() === Number(filterYear) : true;
      return monthMatch && yearMatch;
    });
  }, [projects, filterMonth, filterYear]);

  const smartTotalPages = Math.ceil(smartFilteredProjects.length / itemsPerPage) || 1;
  const smartStartIndex = (currentPage - 1) * itemsPerPage;
  const smartCurrentProjects = smartFilteredProjects.slice(smartStartIndex, smartStartIndex + itemsPerPage);

  const hasFilter = filterMonth || filterYear;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border bg-white border-emerald-200 text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">✓</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Success</p>
            <p className="text-xs text-slate-500">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900">Published Projects</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setIsPublishModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Publish New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month Selector */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Month</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer min-w-[140px] transition-all"
            >
              <option value="">All Months</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year Selector */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Year</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer min-w-[110px] transition-all"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Active Filter Chip */}
        {hasFilter && (
          <div className="mt-5 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <span className="text-xs font-bold text-blue-700">
              {[filterMonth, filterYear].filter(Boolean).join(' ')}
            </span>
            <button
              onClick={() => { setFilterMonth(''); setFilterYear(''); setCurrentPage(1); }}
              className="ml-1 text-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-5 ml-auto text-xs text-slate-400 font-medium">
          {smartFilteredProjects.length} result{smartFilteredProjects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-12">#</th>
                <th className="py-4 px-6">Project Name</th>
                <th className="py-4 px-6">Budget</th>
                <th className="py-4 px-6">Approaches</th>
                <th className="py-4 px-6">Posted Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {smartCurrentProjects.length > 0 ? (
                smartCurrentProjects.map((p, index) => (
                  <tr key={`${p.id}-${index}`} className="hover:bg-blue-50/20 transition-colors group">
                    {/* Serial No */}
                    <td className="py-4 px-6 text-sm font-bold text-slate-400">
                      {smartStartIndex + index + 1}
                    </td>
                    {/* Project Name */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.id.slice(0, 8)}…</p>
                      </div>
                    </td>
                    {/* Budget */}
                    <td className="py-4 px-6">
                      <span className="text-sm font-black text-slate-800 font-mono">{p.amount}</span>
                    </td>
                    {/* Approaches */}
                    <td className="py-4 px-6">
                      {p.approaches > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {p.approaches} Freelancer{p.approaches !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No approaches yet</span>
                      )}
                    </td>
                    {/* Posted Date */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{p.postedDate}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/projects/publish/${p.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => setDropProjectTarget(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Drop
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-500">No projects found</p>
                      <p className="text-xs text-slate-400">Try adjusting the month or year filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Showing {smartFilteredProjects.length > 0 ? smartStartIndex + 1 : 0}–{Math.min(smartStartIndex + itemsPerPage, smartFilteredProjects.length)} of {smartFilteredProjects.length} projects
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: smartTotalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, smartTotalPages))}
              disabled={currentPage === smartTotalPages || smartTotalPages === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PublishProject
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handleCreateProject}
        nextId={String(projects.length + 1).padStart(2, '0')}
      />
      <DropProject
        project={dropProjectTarget}
        onClose={() => setDropProjectTarget(null)}
        onConfirmDrop={handleConfirmDrop}
      />
    </div>
  );
}