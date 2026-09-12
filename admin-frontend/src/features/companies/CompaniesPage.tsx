import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, Download, Plus, X, Eye, CheckCircle, PauseCircle, 
  Ban, ShieldAlert, Copy, ChevronDown, Filter 
} from 'lucide-react';
import api from '@/lib/api';

// Mock Data
type Project = { id: string; title: string; budget: string; status: string; engineer: string };
type AuditLog = { action: string; actor: string; timestamp: string; note: string };
type Company = {
  id: string; name: string; email: string; domain: string; initials: string;
  avatarColor: string; industry: string; status: 'Approved' | 'Pending Approval' | 'Suspended' | 'Banned';
  projectsCount: number; ongoingProjects: number; dateJoined: string; rawDate: number;
  location: string; totalSpent: string; activeSince: string;
  projects: Project[]; auditTrail: AuditLog[];
};



export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDescending, setSortDescending] = useState(true);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [pendingSuspendId, setPendingSuspendId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('KYB / GST Documentation Discrepancy');
  const [suspendNotes, setSuspendNotes] = useState('');

  useEffect(() => {
    api.get('/admin/companies').then(res => {
      if (res.data.success) {
        const dynamicCompanies = res.data.data.map((c: any) => ({
          ...c,
          avatarColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
          rawDate: new Date(c.dateJoined).getTime(),
          location: "N/A",
          totalSpent: "₹0",
          activeSince: new Date(c.dateJoined).toLocaleDateString(),
          projectsCount: c.projects?.total || 0,
          ongoingProjects: c.projects?.ongoing || 0,
          projects: [],
          auditTrail: []
        }));
        setCompanies(dynamicCompanies);
      }
    }).catch(console.error);
  }, []);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPanelOpen(false);
        setSuspendModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Approval
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Suspended
          </span>
        );
      case 'Banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Banned
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'pending' && company.status !== 'Pending Approval') return false;
    if (filter === 'approved' && company.status !== 'Approved') return false;
    if (filter === 'suspended' && company.status !== 'Suspended' && company.status !== 'Banned') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        company.name.toLowerCase().includes(q) ||
        company.email.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q) ||
        company.id.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => sortDescending ? b.rawDate - a.rawDate : a.rawDate - b.rawDate);

  const totalCounts = {
    all: companies.length,
    pending: companies.filter(c => c.status === 'Pending Approval').length,
    approved: companies.filter(c => c.status === 'Approved').length,
    suspended: companies.filter(c => c.status === 'Suspended' || c.status === 'Banned').length,
  };

  const handleAction = (id: string, action: 'Approve' | 'Ban') => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        if (action === 'Approve') {
          toast.success(`Approved ${c.name}`);
          return {
            ...c, status: 'Approved',
            auditTrail: [{ action: "Account Approved", actor: "Super Admin", timestamp: "Just now", note: "Approved via table action" }, ...c.auditTrail]
          };
        } else if (action === 'Ban') {
          if (confirm(`Ban ${c.name}? This takes effect immediately.`)) {
            toast.error(`Account banned: ${c.name}`);
            return {
              ...c, status: 'Banned',
              auditTrail: [{ action: "Banned Account", actor: "Super Admin", timestamp: "Just now", note: "Banned via table action" }, ...c.auditTrail]
            };
          }
        }
      }
      return c;
    }));
    
    if (activeCompany && activeCompany.id === id) {
      setActiveCompany(companies.find(c => c.id === id) || null);
    }
  };

  const confirmSuspend = () => {
    if (!pendingSuspendId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === pendingSuspendId) {
        toast.success(`${c.name} suspended. Reason: ${suspendReason}`);
        return {
          ...c, status: 'Suspended',
          auditTrail: [{ action: `Suspended: ${suspendReason}`, actor: "Super Admin", timestamp: "Just now", note: suspendNotes || "No notes" }, ...c.auditTrail]
        };
      }
      return c;
    }));
    setSuspendModalOpen(false);
    
    if (activeCompany && activeCompany.id === pendingSuspendId) {
       setActiveCompany(companies.find(c => c.id === pendingSuspendId) || null);
    }
  };

  const exportCSV = () => {
    let csv = "ID,Company Name,Email,Industry,Status,Total Projects,Ongoing Projects,Date Joined,Total Spent\n";
    companies.forEach(c => {
      csv += `"${c.id}","${c.name}","${c.email}","${c.industry}","${c.status}",${c.projectsCount},${c.ongoingProjects},"${c.dateJoined}","${c.totalSpent}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HTGE_Companies_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    toast.success("CSV Export downloaded");
  };

  const copyDossier = () => {
    if (!activeCompany) return;
    const txt = `HTGE Entity Dossier: ${activeCompany.name} (${activeCompany.id})\nStatus: ${activeCompany.status}\nEmail: ${activeCompany.email}\nProjects: ${activeCompany.projectsCount} (${activeCompany.ongoingProjects} ongoing)\nTotal Spent: ${activeCompany.totalSpent}`;
    navigator.clipboard.writeText(txt);
    toast.success("Company dossier copied");
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA] relative text-base">
      
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Companies</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage enterprise client accounts, compliance status, and projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition" 
              placeholder="Search company or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => toast.success("Opening Invitation Modal")} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-bold shadow-sm transition">
            <Plus className="w-5 h-5" />
            <span>Invite Company</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col overflow-y-auto">

      {/* Filter Chips */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-3 overflow-x-auto mb-5">
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}>
            All <span className="ml-1 opacity-80 font-mono text-[11px]">{totalCounts.all}</span>
          </button>
          <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${filter === 'pending' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span> Pending Approval <span className="ml-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full font-mono text-[11px]">{totalCounts.pending}</span>
          </button>
          <button onClick={() => setFilter('approved')} className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${filter === 'approved' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Approved <span className="ml-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-mono text-[11px]">{totalCounts.approved}</span>
          </button>
          <button onClick={() => setFilter('suspended')} className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${filter === 'suspended' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span> Suspended <span className="ml-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full font-mono text-[11px]">{totalCounts.suspended}</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Sort by: <strong className="text-slate-700 font-semibold cursor-pointer hover:underline" onClick={() => setSortDescending(!sortDescending)}>{sortDescending ? 'Recent Application ↓' : 'Oldest Account ↑'}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 sticky top-0 z-10 select-none">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] w-12 text-center">S.No</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Company</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Industry</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Projects</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Date Joined</th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No companies found</h4>
                      <p className="text-xs text-slate-500 mt-1">No company records match your current filters.</p>
                      <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-3.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold">Reset Filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c, idx) => (
                  <tr key={c.id} className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer border-b border-[#F1F5F9]" onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.action-btn')) return;
                    setActiveCompany(c);
                    setIsPanelOpen(true);
                  }}>
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px] font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${c.avatarColor} text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0 tracking-wider`}>{c.initials}</div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <span className="text-[10px] font-mono font-normal text-slate-400">#{c.id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{c.industry}</span></td>
                    <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-500 font-medium text-[12px]">
                        <strong className="text-slate-700 font-semibold">{c.projectsCount} projects</strong> <span className="text-slate-400 text-[11px]">({c.ongoingProjects} ongoing)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[12px] whitespace-nowrap">{c.dateJoined}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button className="action-btn p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Inspect Company Dossier" onClick={() => { setActiveCompany(c); setIsPanelOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className={`action-btn p-1.5 rounded-md transition-colors ${c.status === 'Approved' ? 'text-emerald-300 opacity-40 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} disabled={c.status === 'Approved'} onClick={() => handleAction(c.id, 'Approve')}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className={`action-btn p-1.5 rounded-md transition-colors ${c.status === 'Suspended' ? 'text-amber-300 opacity-40 cursor-not-allowed' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`} disabled={c.status === 'Suspended'} onClick={() => { setPendingSuspendId(c.id); setSuspendModalOpen(true); }}>
                          <PauseCircle className="w-4 h-4" />
                        </button>
                        <button className={`action-btn p-1.5 rounded-md transition-colors ${c.status === 'Banned' ? 'text-rose-300 opacity-40 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`} disabled={c.status === 'Banned'} onClick={() => handleAction(c.id, 'Ban')}>
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[#F8FAFC] px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-2">
            <span>Showing <span className="font-semibold text-slate-800">1–{filteredCompanies.length}</span> of <span className="font-semibold text-slate-800">{filteredCompanies.length}</span> enterprise accounts</span>
          </div>
        </div>
      </div>
      </main>

      {/* Slide-Over Backdrop */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-custom z-40 transition-opacity" onClick={() => setIsPanelOpen(false)}></div>
      )}

      {/* Slide-Over Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {activeCompany && (
          <>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-bold">{activeCompany.id}</span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-semibold text-slate-600">Entity Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copyDossier} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors" title="Copy entity details">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => setIsPanelOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors" title="Close drawer (Esc)">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0 ${activeCompany.avatarColor}`}>
                  {activeCompany.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{activeCompany.name}</h3>
                    {getStatusBadge(activeCompany.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{activeCompany.email}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span className="font-medium text-slate-600">{activeCompany.industry}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-500">{activeCompany.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
                <div className="text-center p-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Projects</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{activeCompany.projectsCount}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">{activeCompany.ongoingProjects} Ongoing</div>
                </div>
                <div className="text-center border-x border-slate-200 px-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Spent</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{activeCompany.totalSpent}</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Escrow Clear</div>
                </div>
                <div className="text-center p-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Since</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{activeCompany.activeSince}</div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Administrative Enforcement</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Immediate Effect</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleAction(activeCompany.id, 'Approve')} className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-200 text-emerald-800 transition-all">
                    <CheckCircle className="w-4 h-4 mb-1 text-emerald-600" />
                    <span className="text-[11px] font-bold">Approve</span>
                  </button>
                  <button onClick={() => { setPendingSuspendId(activeCompany.id); setSuspendModalOpen(true); }} className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 active:bg-amber-200 text-amber-800 transition-all">
                    <PauseCircle className="w-4 h-4 mb-1 text-amber-600" />
                    <span className="text-[11px] font-bold">Suspend</span>
                  </button>
                  <button onClick={() => handleAction(activeCompany.id, 'Ban')} className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100/80 active:bg-rose-200 text-rose-800 transition-all">
                    <Ban className="w-4 h-4 mb-1 text-rose-600" />
                    <span className="text-[11px] font-bold">Ban Account</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Recent Projects (Top 5)</h4>
                </div>
                <div className="space-y-2">
                  {activeCompany.projects.slice(0, 5).map(p => (
                    <div key={p.id} className="p-3 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">{p.id}</span>
                          <h5 className="text-xs font-semibold text-slate-800 truncate">{p.title}</h5>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Budget: <strong className="text-slate-600">{p.budget}</strong></span>
                          <span>•</span>
                          <span>Lead: <strong className="text-slate-600">{p.engineer}</strong></span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Audit Trail</h4>
                  <span className="text-[10px] font-mono text-slate-400">Cryptographic Hash Verified</span>
                </div>
                <div className="space-y-3">
                  {activeCompany.auditTrail.slice(0, 5).map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 ring-4 ring-blue-50"></div>
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[11px]">{a.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{a.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.note}</p>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">Actor: {a.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">Admin Operator: <strong>Elena Vance</strong></span>
              <button onClick={() => setIsPanelOpen(false)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition-colors">
                Done
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-custom z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Suspend Entity with Reason</h3>
                <p className="text-xs text-slate-500">Freezes active dispatch & escrow releases.</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-700">Select Suspension Reason</label>
              <select value={suspendReason} onChange={e => setSuspendReason(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <option value="KYB / GST Documentation Discrepancy">KYB / GST Documentation Discrepancy</option>
                <option value="Escrow Deposit Default / Insufficient Reserve">Escrow Deposit Default / Insufficient Reserve</option>
                <option value="Freelancer Dispute Under Formal Investigation">Freelancer Dispute Under Formal Investigation</option>
                <option value="Breach of Marketplace Communications Policy">Breach of Marketplace Communications Policy</option>
                <option value="Administrative Freeze (Risk Control)">Administrative Freeze (Risk Control)</option>
              </select>
              
              <label className="block text-xs font-semibold text-slate-700 mt-2">Additional Internal Notes</label>
              <textarea value={suspendNotes} onChange={e => setSuspendNotes(e.target.value)} rows={2} placeholder="Provide context for audit logs..." className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setSuspendModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={confirmSuspend} className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors">
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
