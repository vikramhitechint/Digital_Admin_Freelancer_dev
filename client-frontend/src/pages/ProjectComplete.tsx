import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ProjectsComplete() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects?status=COMPLETED');
        const mapped = res.data.filter((p: any) => p.status === 'COMPLETED').map((p: any) => ({
          id: p.id,
          name: p.title,
          amount: `₹${Number(p.budget).toLocaleString()}`,
          duration: p.timeline || 'TBD',
          completionDate: new Date(p.updatedAt).toLocaleDateString(),
          rating: 5, // Mock rating for now
        }));
        setProjects(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const renderStars = (rating: number | string) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Number(rating)
            ? "text-amber-400 fill-amber-400 drop-shadow-xs"
            : "text-slate-200 fill-slate-200"
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FROM</span>
        <input
          type="date"
          defaultValue="2026-01-01"
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
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6">Completion Date</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-400">{p.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-4 px-6 font-serif font-bold text-slate-800">{p.amount}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">{p.duration}</td>
                  <td className="py-4 px-6 text-slate-500">{p.completionDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-0.5">{renderStars(p.rating)}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => navigate(`/projects/complete/${p.id}`)}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}