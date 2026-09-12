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
        postedDate: new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
  const [selectedMonth, setSelectedMonth] = useState("All months");
  const [selectedYear, setSelectedYear] = useState("All years");
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

  // No need to sync to localStorage now

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
      showToast(`Project dropped successfully. Platform fee of ${feeAmount} processed.`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      showToast("Failed to drop project", "error");
    }
  };

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      if (selectedMonth !== "All months") {
        const itemMonthStr = item.postedDate.split(" ")[0]; // Month is now the first word due to 'long' format
        const selectedMonthPrefix = selectedMonth.slice(0, 3);
        if (!itemMonthStr.startsWith(selectedMonthPrefix)) return false;
      }
      if (selectedYear !== "All years") {
        const itemYear = item.postedDate.split(" ")[2];
        if (itemYear !== selectedYear) return false;
      }
      return true;
    });
  }, [projects, selectedMonth, selectedYear]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border bg-white border-blue-200 text-slate-800 animate-slide-up">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            ✓
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Success</p>
            <p className="text-xs text-slate-600">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Top Filter Bar & Publish Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 shadow-sm"
          >
            <option>All months</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 shadow-sm"
          >
            <option>All years</option>
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>

        <button
          onClick={() => setIsPublishModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Publish new project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">S.NO</th>
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Approaches</th>
                <th className="py-3.5 px-6">Posted Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {currentProjects.length > 0 ? (
                currentProjects.map((p, index) => (
                  <tr key={`${p.id}-${index}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400">{p.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-4 px-6 font-serif font-bold text-slate-800">{p.amount}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{p.approaches}</td>
                    <td className="py-4 px-6 text-slate-500">{p.postedDate}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/projects/publish/${p.id}`)}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setDropProjectTarget(p)}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Drop
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No projects found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {filteredProjects.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 1. Publish Modal Overlay */}
      <PublishProject
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handleCreateProject}
        nextId={String(projects.length + 1).padStart(2, "0")}
      />

      {/* 2. Drop Project (10% Fee) Modal Overlay */}
      <DropProject
        project={dropProjectTarget}
        onClose={() => setDropProjectTarget(null)}
        onConfirmDrop={handleConfirmDrop}
      />
    </div>
  );
}