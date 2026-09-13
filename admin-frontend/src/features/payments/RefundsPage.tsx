import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function RefundsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDropRequests = async () => {
    try {
      const res = await api.get('/admin/projects');
      const dropRequests = res.data.data.filter((p: any) => p.status === 'DROP_REQUESTED');
      setProjects(dropRequests);
    } catch (err) {
      toast.error('Failed to load drop requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropRequests();
  }, []);

  const handleApproveDrop = async (projectId: string) => {
    try {
      await api.put(`/projects/${projectId}/approve-drop`);
      toast.success('Drop approved and refund processed successfully.');
      fetchDropRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve drop');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading drop requests...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Disputes & Refunds Desk</h1>
          <p className="text-slate-500 mt-2">Manage client drop requests and approve refunds securely.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">All clear!</h3>
            <p className="text-slate-500 mt-2">There are no pending drop requests.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Project Title</th>
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Budget</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{p.title}</td>
                  <td className="py-4 px-6">{p.client?.fullName || 'Unknown Client'}</td>
                  <td className="py-4 px-6 font-mono font-semibold text-slate-700">
                    ₹{Number(p.budget).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleApproveDrop(p.id)}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Approve & Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
