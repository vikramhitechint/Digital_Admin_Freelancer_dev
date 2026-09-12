import React, { useState } from 'react';
import { 
  Search, CheckCircle2, AlertCircle, Download, CreditCard, ShieldCheck, ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

type Payment = {
  id: string; 
  paymentId: string; 
  projectTitle: string; 
  companyName: string;
  amount: string; 
  gateway: 'Razorpay' | 'Cashfree';
  status: 'In Escrow' | 'Released' | 'Refunded';
  date: string;
};

const paymentsData: Payment[] = [
  { id: '1', paymentId: 'pay_Rzp94820194', projectTitle: 'Zero-Knowledge Rollup Settlement', companyName: 'Apex AI Labs', amount: '₹4,80,000', gateway: 'Razorpay', status: 'In Escrow', date: 'Today, 09:42 AM' },
  { id: '2', paymentId: 'cf_9940128472', projectTitle: 'PCI-DSS V4 Token Vault', companyName: 'QuantMesh Tech', amount: '₹6,20,000', gateway: 'Cashfree', status: 'In Escrow', date: 'Yesterday, 18:15 PM' },
  { id: '3', paymentId: 'pay_Rzp88391200', projectTitle: 'Telehealth Portal', companyName: 'HyperScale Health', amount: '₹8,50,000', gateway: 'Razorpay', status: 'Released', date: 'Jun 10, 2025' },
  { id: '4', paymentId: 'cf_8835019283', projectTitle: 'Telemetry Engine', companyName: 'Nexus Robotics', amount: '₹7,40,000', gateway: 'Cashfree', status: 'Released', date: 'Jun 05, 2025' },
  { id: '5', paymentId: 'pay_Rzp88200492', projectTitle: 'Kubernetes Operator', companyName: 'CloudVerve', amount: '₹5,50,000', gateway: 'Razorpay', status: 'Refunded', date: 'May 28, 2025' },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState(paymentsData);
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p => p.paymentId.toLowerCase().includes(search.toLowerCase()) || p.companyName.toLowerCase().includes(search.toLowerCase()));

  const handleRelease = (id: string) => {
    toast.success('Funds released from escrow securely.');
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'Released' } : p));
  };

  const handleRefund = (id: string) => {
    toast('Funds refunded to client.', { icon: '🔄' });
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'Refunded' } : p));
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payments & Escrow</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage escrow deposits, freelancer payouts, and client refunds.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition" 
              placeholder="Search Payment ID or Company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Published Projects (Unassigned)</h3>
            <div className="text-3xl font-black text-slate-900 font-mono">₹11,00,000</div>
            <p className="text-sm font-medium text-slate-500 mt-2">Potential escrow awaiting assignment</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Ongoing Revenue (Escrowed)</h3>
            <div className="text-3xl font-black text-amber-900 font-mono">₹8,50,000</div>
            <p className="text-sm font-medium text-amber-700 mt-2">Locked in platform escrow vault</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Completed Revenue (Settled)</h3>
            <div className="text-3xl font-black text-emerald-900 font-mono">₹12,90,000</div>
            <p className="text-sm font-medium text-emerald-700 mt-2">Successfully released to freelancers</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Transaction Details</th>
                  <th className="py-4 px-6">Project & Client</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Escrow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${payment.gateway === 'Razorpay' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
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
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      {payment.amount}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        payment.status === 'In Escrow' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        payment.status === 'Released' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {payment.status === 'In Escrow' && <ShieldCheck className="w-3.5 h-3.5" />}
                        {payment.status === 'Released' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {payment.status === 'Refunded' && <AlertCircle className="w-3.5 h-3.5" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {payment.status === 'In Escrow' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleRelease(payment.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition"
                          >
                            Release Funds
                          </button>
                          <button 
                            onClick={() => handleRefund(payment.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            title="Refund to Client"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Action Completed</span>
                      )}
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
