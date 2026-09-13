import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function ProjectDropped() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        const mapped = res.data.filter((p: any) => p.status === 'DROPPED' || p.status === 'DROP_REQUESTED').map((p: any) => ({
          id: p.id,
          name: p.title,
          amount: `₹${Number(p.budget).toLocaleString()}`,
          duration: p.timeline || 'TBD',
          dropDate: new Date(p.updatedAt).toLocaleDateString(),
          status: p.status,
        }));
        setProjects(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

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
          defaultValue="2026-12-31"
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
                <th className="py-3.5 px-6">Drop Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {projects.length > 0 ? projects.map((p, index) => (
                <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-400">{index + 1}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-4 px-6 font-serif font-bold text-slate-800">{p.amount}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">{p.duration}</td>
                  <td className="py-4 px-6 text-slate-500">{p.dropDate}</td>
                  <td className="py-4 px-6">
                    {p.status === 'DROP_REQUESTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md border bg-purple-50 text-purple-700 border-purple-200">
                        REFUND PENDING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md border bg-slate-100 text-slate-500 border-slate-200">
                        DROPPED
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No dropped projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
