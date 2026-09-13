import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, Download, CreditCard, ShieldCheck, ArrowRightLeft, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Payment = {
  id: string; paymentId: string; projectId: string; projectTitle: string; companyName: string;
  amount: string; gateway: 'Razorpay' | 'Cashfree'; status: 'In Escrow' | 'Released' | 'Refunded'; date: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState({ published: '₹0', ongoing: '₹0', completed: '₹0' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments');
      if (res.data.success) {
        setPayments(res.data.data.transactions || []);
        setTotals(res.data.data.totals || { published: '₹0', ongoing: '₹0', completed: '₹0' });
      }
    } catch (err) { console.error('Failed to load payments', err); }
    finally { setLoading(false); }
  };

  const filtered = payments.filter(p =>
    p.paymentId?.toLowerCase().includes(search.toLowerCase()) ||
    p.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    p.projectTitle?.toLowerCase().includes(search.toLowerCase())
  );
  const inEscrow = payments.filter(p => p.status === 'In Escrow');
  const refunded = payments.filter(p => p.status === 'Refunded');

  const handleRelease = async (projectId: string, paymentId: string) => {
    try {
      await api.put(`/projects/${projectId}/complete`);
      toast.success('Funds released from escrow securely.');
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'Released' as const } : p));
      fetchPayments(); // Refresh totals
    } catch (err) {
      toast.error('Failed to release funds.');
    }
  };
  const handleRefund = async (projectId: string, paymentId: string) => {
    if (!window.confirm('Confirm refund to client?')) return;
    try {
      await api.put(`/projects/${projectId}/approve-drop`);
      toast('Funds refunded to client.', { icon: '🔄' });
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'Refunded' as const } : p));
      fetchPayments();
    } catch (err) {
      toast.error('Failed to refund funds.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA]">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payments &amp; Escrow</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage escrow deposits, freelancer payouts, and client refunds.</p>
        </div>
        <div className="flex items-center gap-4">
          {inEscrow.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <Bell className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{inEscrow.length} Escrow Pending</span>
            </div>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition"
              placeholder="Search Payment ID, Company, or Project..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition">
            <Download className="w-4 h-4 text-slate-500" /><span>Export CSV</span>
          </button>
        </div>
      </header>

      {refunded.length > 0 && (
        <div className="mx-8 mt-6 flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Refund Notification</p>
            <p className="text-xs text-amber-700 mt-0.5">{refunded.length} payment{refunded.length > 1 ? 's have' : ' has'} been refunded to clients. Please process through Razorpay within 5–7 business days.</p>
          </div>
        </div>
      )}

      <div className="px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Published (Unassigned)</h3>
            <div className="text-3xl font-black text-slate-900 font-mono">{totals.published}</div>
            <p className="text-sm font-medium text-slate-500 mt-2">Potential escrow awaiting assignment</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Ongoing (Escrowed)</h3>
            <div className="text-3xl font-black text-amber-900 font-mono">{totals.ongoing}</div>
            <p className="text-sm font-medium text-amber-700 mt-2">Locked in platform escrow vault</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Completed (Settled)</h3>
            <div className="text-3xl font-black text-emerald-900 font-mono">{totals.completed}</div>
            <p className="text-sm font-medium text-emerald-700 mt-2">Successfully released to freelancers</p>
          </div>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Transaction Details</th>
                  <th className="py-4 px-6">Project &amp; Client</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Escrow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><p className="text-sm text-slate-400 animate-pulse">Loading payment data...</p></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center"><CreditCard className="w-8 h-8 text-slate-300" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">No payment records found</p>
                        <p className="text-xs text-slate-400 mt-1">{search ? 'Try a different search term' : 'Payments appear here once clients pay for projects via Razorpay'}</p>
                      </div>
                    </div>
                  </td></tr>
                ) : filtered.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${payment.gateway === 'Razorpay' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><CreditCard className="w-5 h-5" /></div>
                        <div>
                          <div className="font-mono font-semibold text-slate-900">{payment.paymentId}</div>
                          <div className="text-xs text-slate-500">{payment.date} via {payment.gateway}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{payment.projectTitle}</div>
                      <div className="text-xs text-slate-500">{payment.companyName}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">{payment.amount}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${payment.status === 'In Escrow' ? 'bg-amber-50 text-amber-700 border-amber-200' : payment.status === 'Released' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {payment.status === 'In Escrow' && <ShieldCheck className="w-3.5 h-3.5" />}
                        {payment.status === 'Released' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {payment.status === 'Refunded' && <AlertCircle className="w-3.5 h-3.5" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {payment.status === 'In Escrow' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleRelease(payment.projectId, payment.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition">Release Funds</button>
                          <button onClick={() => handleRefund(payment.projectId, payment.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Refund to Client"><ArrowRightLeft className="w-4 h-4" /></button>
                        </div>
                      ) : <span className="text-xs text-slate-400 font-medium">Action Completed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
