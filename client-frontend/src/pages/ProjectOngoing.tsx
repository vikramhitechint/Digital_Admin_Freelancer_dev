import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropProject from "../components/projectongoing/DropProject";
import api from "../utils/api";
import { UIProject } from "../types";

export default function ProjectsOngoing() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectToDrop, setProjectToDrop] = useState<any>(null);
  const [dropToast, setDropToast] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?status=ONGOING');
      // For now, client sees all ongoing projects. In production: api.get('/projects?clientId=...') and filter.
      const mapped = res.data.filter((p: any) => p.status === 'ONGOING').map((p: any) => ({
        id: p.id,
        name: p.title,
        amount: `₹${Number(p.budget).toLocaleString()}`,
        involved: p.freelancers?.map((f: any) => f.freelancer.fullName).join(', ') || 'None',
      }));
      setProjects(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handler for drop confirmation after Razorpay payment
  const handleConfirmDrop = async (projectId: string, feePaid: string | number) => {
    try {
      await api.put(`/projects/${projectId}/drop`);
      setProjectToDrop(null);
      setDropToast(`Drop requested successfully. Awaiting Admin approval for refund processing.`);
      setTimeout(() => setDropToast(""), 4000);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {dropToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-white border-amber-200 text-slate-800 animate-slide-up">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
            ✓
          </div>
          <span className="text-xs font-medium text-slate-700">{dropToast}</span>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FROM</span>
        <input
          type="date"
          defaultValue="2026-08-01"
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 shadow-sm"
        />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">TO</span>
        <input
          type="date"
          defaultValue="2026-08-31"
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">S.NO</th>
                <th className="py-3.5 px-6">Project Title</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Involved</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-400">{p.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-4 px-6 font-serif font-bold text-slate-800">{p.amount}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">{p.involved}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {/* View Button: Navigates to ViewOngoingProject */}
                    <button
                      onClick={() => navigate(`/projects/ongoing/${p.id}`)}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      View
                    </button>

                    {/* Drop Button: Opens 25% Freelancer Effort Charge Modal */}
                    <button
                      onClick={() => setProjectToDrop(p)}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 25% Effort Charge Drop Modal */}
      {projectToDrop && (
        <DropProject
          project={projectToDrop}
          feePercentage={25}
          feeLabel="Freelancer Effort Charge"
          onClose={() => setProjectToDrop(null)}
          onConfirmDrop={handleConfirmDrop}
        />
      )}
    </div>
  );
}