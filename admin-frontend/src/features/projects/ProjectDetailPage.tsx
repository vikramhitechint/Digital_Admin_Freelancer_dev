import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, ImageIcon, Star, MessageSquare, UserCheck, Check, X, Download, Clock, IndianRupee, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// ── All project data from client data.json ────
const allProjects: Record<string, {
  id: string; name: string; amount: string; status: string; adminStatus: string;
  postedDate: string; completionDate: string; company: string; description: string;
  skills: string[]; sampleLinks: { label: string; url: string }[];
  sampleImages: { name: string; size: string; type: string }[];
  approaches?: number; duration?: string; rating?: number; freelancer?: string;
  freelancerReceived?: string; paymentNote?: string;
  deliverables?: { name: string; size?: string; type: string; fileType: string; url?: string; urlLabel?: string }[];
  timeline?: { label: string; date: string; time: string; note: string; color: string }[];
  freelancerApproaches?: {
    id: number; name: string; subtitle: string; role: string; rating: string;
    completed: number; bidAmount: string; avatarBg: string; avatarInitials: string;
    email: string; experience: string; bio: string;
  }[];
}> = {
  '01': {
    id: '01', name: 'E-Commerce Platform Redesign', amount: '₹1,50,000',
    status: 'PENDING_ADMIN_REVIEW', adminStatus: 'Pending Review',
    postedDate: '02 Aug 2026', completionDate: '15 Feb 2025',
    company: 'HTGE Operations', approaches: 6,
    description: 'We are looking for an experienced freelancer to redesign our e-commerce platform. The project includes UI/UX overhaul, responsive design implementation, and integration with existing backend systems. Must have 5+ years of experience in React and responsive design.',
    skills: ['React', 'Node.js', 'MongoDB', 'Figma', 'Responsive Design'],
    sampleLinks: [
      { label: 'Figma Design System', url: 'https://www.figma.com/@htge-ecommerce-ui' },
      { label: 'Live Demo Prototype', url: 'https://preview.htge.in/ecommerce-demo' },
      { label: 'API Specification Docs', url: 'https://docs.htge.in/api/v2' },
    ],
    sampleImages: [
      { name: 'dashboard_wireframe.png', size: '1.4 MB', type: 'image' },
      { name: 'checkout_user_flow.png', size: '2.1 MB', type: 'image' },
      { name: 'api_endpoints_doc.pdf', size: '640 KB', type: 'doc' },
    ],
    freelancerApproaches: [
      { id: 1, name: 'Rahul Sharma', subtitle: 'React Developer', role: 'Frontend', rating: '4.8', completed: 24, bidAmount: '₹1,20,000', avatarBg: 'bg-blue-100 text-blue-700', avatarInitials: 'RS', email: 'rahul.sharma@example.com', experience: '5+ years', bio: 'Experienced frontend engineer specialized in building pixel-perfect, responsive applications with React and Tailwind CSS.' },
      { id: 2, name: 'Priya Nair', subtitle: 'UI/UX Designer', role: 'Designer', rating: '4.9', completed: 18, bidAmount: '₹95,000', avatarBg: 'bg-teal-100 text-teal-700', avatarInitials: 'PN', email: 'priya.nair@example.com', experience: '4 years', bio: 'Product designer focusing on human-centered design, Figma component systems, and design tokens.' },
      { id: 3, name: 'Amit Verma', subtitle: 'Backend Engineer', role: 'Backend', rating: '4.6', completed: 31, bidAmount: '₹1,40,000', avatarBg: 'bg-indigo-100 text-indigo-700', avatarInitials: 'AV', email: 'amit.verma@example.com', experience: '5 years', bio: 'Specialized in microservice architectures, high concurrency Node.js systems, and PostgreSQL.' },
      { id: 4, name: 'Sara Thomas', subtitle: 'Full Stack Developer', role: 'Full Stack', rating: '4.7', completed: 22, bidAmount: '₹1,25,000', avatarBg: 'bg-sky-100 text-sky-700', avatarInitials: 'ST', email: 'sara.thomas@example.com', experience: '6 years', bio: 'Full stack engineer delivering end-to-end user workflows, API integration, and clean UX.' },
      { id: 5, name: 'Vikram Malhotra', subtitle: 'Cloud & DevOps Specialist', role: 'DevOps', rating: '4.9', completed: 38, bidAmount: '₹1,30,000', avatarBg: 'bg-purple-100 text-purple-700', avatarInitials: 'VM', email: 'vikram.m@example.com', experience: '7 years', bio: 'AWS & GCP certified architect for scalable multi-region web infrastructure.' },
      { id: 6, name: 'Neha Kapoor', subtitle: 'Lead Product Designer', role: 'Designer', rating: '5.0', completed: 45, bidAmount: '₹1,15,000', avatarBg: 'bg-pink-100 text-pink-700', avatarInitials: 'NK', email: 'neha.k@example.com', experience: '5+ years', bio: 'Award winning product designer with extensive e-commerce mobile and web experience.' },
    ],
  },
  '02': {
    id: '02', name: 'Payments API Integration', amount: '₹7,200', status: 'ASSIGNMENT_PENDING', adminStatus: 'Assignment Pending', postedDate: '28 Jul 2026', completionDate: '15 Aug 2026', company: 'HTGE Operations', approaches: 4, description: 'Integration of Razorpay and Stripe payment gateways with webhook listeners, refund automation, and instant reconciliation.', skills: ['Node.js', 'Express', 'Stripe API', 'Razorpay', 'PostgreSQL'], sampleLinks: [{ label: 'Payment Sequence Docs', url: 'https://stripe.com/docs/api' }], sampleImages: [{ name: 'payment_architecture.png', size: '950 KB', type: 'image' }, { name: 'security_checklist.pdf', size: '320 KB', type: 'doc' }],
    freelancerApproaches: [
      { id: 1, name: 'Amit Verma', subtitle: 'Backend Engineer', role: 'Backend', rating: '4.6', completed: 31, bidAmount: '₹6,800', avatarBg: 'bg-indigo-100 text-indigo-700', avatarInitials: 'AV', email: 'amit.verma@example.com', experience: '5 years', bio: 'Built multiple fintech payment pipes.' },
      { id: 2, name: 'Sara Thomas', subtitle: 'Full Stack Developer', role: 'Full Stack', rating: '4.7', completed: 22, bidAmount: '₹7,000', avatarBg: 'bg-sky-100 text-sky-700', avatarInitials: 'ST', email: 'sara.thomas@example.com', experience: '6 years', bio: 'Payment flow design & secure webhook infrastructure.' },
    ],
  },
  'c01': {
    id: 'c01', name: 'Analytics Dashboard Build', amount: '₹9,500', status: 'COMPLETED', adminStatus: 'Completed', postedDate: '14 May 2026', completionDate: '01 Jul 2026', company: 'TechWave Pvt Ltd', duration: '48 days', rating: 5, freelancer: 'Rahul Sharma', freelancerReceived: '₹8,550', paymentNote: 'Payment was released to freelancer on 02 Jul 2026. HTGE platform fee retained.', description: 'Custom Chart.js and Tailwind based operations dashboard with multi-channel filtering.', skills: ['React', 'Chart.js', 'Tailwind CSS', 'Recharts'], sampleLinks: [{ label: 'Dashboard Wireframe', url: 'https://figma.com/@htge-analytics' }], sampleImages: [{ name: 'charts_spec.png', size: '1.1 MB', type: 'image' }],
    deliverables: [{ name: 'Dashboard_Final.fig', size: '2.5 MB', type: 'Figma', fileType: 'file' }, { name: 'Design_Specs_&_Component_Library.pdf', size: '1.2 MB', type: 'PDF', fileType: 'file' }, { name: 'Drive Link', url: 'https://figma.com/design/abc123', urlLabel: 'https://figma.com/design/abc123', fileType: 'link', type: 'link' }],
    timeline: [{ label: 'Project Published', date: '14 May 2026', time: '10:00 AM', note: '', color: 'blue' }, { label: 'Work Started', date: '15 May 2026', time: '2:30 PM', note: 'Payment processed', color: 'blue' }, { label: 'Project Marked In Progress', date: '16 May 2026', time: '3:00 PM', note: '', color: 'blue' }, { label: 'Completion Submitted', date: '01 Jul 2026', time: '5:45 PM', note: '', color: 'blue' }, { label: 'Approved & Completed', date: '01 Jul 2026', time: '7:15 PM', note: 'Payment released', color: 'green' }],
    freelancerApproaches: [],
  },
};

const statusBadge: Record<string, string> = {
  PENDING_ADMIN_REVIEW: 'badge-yellow',
  ASSIGNMENT_PENDING: 'badge-orange',
  APPROVED: 'badge-blue',
  ONGOING: 'badge-blue',
  COMPLETED: 'badge-green',
  DROPPED: 'badge-red',
  DISPUTED: 'badge-red',
};
const statusLabel: Record<string, string> = {
  PENDING_ADMIN_REVIEW: 'Pending Review',
  ASSIGNMENT_PENDING: 'Assignment Pending',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignedId, setAssignedId] = useState<number | null>(null);
  const [approving, setApproving] = useState(false);

  const project = allProjects[id ?? '01'] ?? allProjects['01'];

  const handleApprove = async () => {
    setApproving(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`Project "${project.name}" approved!`);
    setApproving(false);
  };

  const handleAssign = (freelancerId: number, name: string) => {
    setAssignedId(freelancerId);
    toast.success(`${name} has been assigned to this project!`);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/admin/projects')}
            className="btn-secondary btn-sm flex items-center gap-1 mt-1">
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="page-title">{project.name}</h1>
              <span className={`badge ${statusBadge[project.status] ?? 'badge-slate'}`}>
                {statusLabel[project.status] ?? project.adminStatus}
              </span>
            </div>
            <p className="page-subtitle">Posted {project.postedDate} · {project.company}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {project.status === 'PENDING_ADMIN_REVIEW' && (
            <>
              <button onClick={handleApprove} disabled={approving}
                className="btn-success flex items-center gap-1.5">
                <Check size={14} /> {approving ? 'Approving...' : 'Approve'}
              </button>
              <button className="btn-danger flex items-center gap-1.5">
                <X size={14} /> Reject
              </button>
            </>
          )}
          <button onClick={() => navigate(`/admin/messages`)}
            className="btn-secondary flex items-center gap-1.5">
            <MessageSquare size={14} /> Open Chat
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: IndianRupee, label: 'Budget', value: project.amount, color: '#2563EB' },
          { icon: Clock, label: 'Timeline', value: project.duration ?? `Due ${project.completionDate}`, color: '#F59E0B' },
          { icon: Users, label: 'Approaches', value: project.approaches ? `${project.approaches} bids` : project.freelancer ?? '—', color: '#10B981' },
          { icon: Calendar, label: 'Status', value: project.adminStatus, color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color + '15' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-sm font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Description + Files */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Project Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
          </div>

          {/* Required Skills */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map(s => (
                <span key={s} className="badge badge-blue text-xs px-3 py-1">{s}</span>
              ))}
            </div>
          </div>

          {/* Sample Links */}
          {project.sampleLinks.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Sample Links</h3>
              <div className="flex flex-wrap gap-2">
                {project.sampleLinks.map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
                    <ExternalLink size={11} /> {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sample Docs */}
          {project.sampleImages.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Sample Docs & Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.sampleImages.map(f => (
                  <div key={f.name}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: f.type === 'image' ? '#EFF6FF' : '#FEF2F2' }}>
                      {f.type === 'image'
                        ? <ImageIcon size={16} className="text-blue-600" />
                        : <FileText size={16} className="text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-400">{f.size}</p>
                    </div>
                    <Download size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables (for completed) */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Deliverables</h3>
              <div className="space-y-2">
                {project.deliverables.map(d => (
                  <div key={d.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {d.fileType === 'link' ? <ExternalLink size={14} className="text-blue-600" /> : <FileText size={14} className="text-slate-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-800">{d.name}</p>
                      {d.size && <p className="text-[11px] text-slate-400">{d.size} · {d.type}</p>}
                      {d.urlLabel && <p className="text-[11px] text-blue-600">{d.urlLabel}</p>}
                    </div>
                    <Download size={13} className="text-slate-400 hover:text-blue-600 cursor-pointer" />
                  </div>
                ))}
              </div>
              {project.paymentNote && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  💰 {project.paymentNote}
                </div>
              )}
            </div>
          )}

          {/* Timeline (for completed) */}
          {project.timeline && project.timeline.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Project Timeline</h3>
              <div className="space-y-0">
                {project.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${t.color === 'green' ? 'bg-emerald-500 border-emerald-500' : 'bg-blue-500 border-blue-500'}`} />
                      {i < project.timeline!.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: '28px' }} />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold text-slate-800">{t.label}</p>
                      <p className="text-[11px] text-slate-400">{t.date} · {t.time}</p>
                      {t.note && <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Project Brief */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Project Brief</h3>
            <div className="space-y-3">
              {[
                { label: 'Company', value: project.company },
                { label: 'Budget', value: project.amount },
                { label: 'Deadline', value: project.completionDate },
                { label: 'Status', value: project.adminStatus },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating for completed */}
          {project.rating && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Client Rating</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={20} className={s <= project.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                ))}
                <span className="text-sm font-bold text-slate-700 ml-1">{project.rating}.0</span>
              </div>
              {project.freelancerReceived && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Freelancer received</span>
                    <span className="font-bold text-emerald-600">{project.freelancerReceived}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-500">Platform fee (10%)</span>
                    <span className="font-bold text-blue-600">₹{Math.round(parseInt(project.amount.replace(/[^0-9]/g, '')) * 0.1).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Freelancer Approaches — only for published/assignment pending */}
      {project.freelancerApproaches && project.freelancerApproaches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">
              Freelancer Approaches
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {project.freelancerApproaches.length} freelancers have approached on this project
            </p>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name & Skill</th>
                <th>Role</th>
                <th>Rating</th>
                <th>Completed</th>
                <th>Bid Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.freelancerApproaches.map((f, i) => (
                <tr key={f.id}
                  className={assignedId === f.id ? 'bg-emerald-50' : ''}>
                  <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`avatar avatar-md font-bold text-xs ${f.avatarBg}`}>
                        {f.avatarInitials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{f.name}</p>
                        <p className="text-[11px] text-slate-400">{f.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{f.role}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{f.rating}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">{f.completed} projects</td>
                  <td className="font-bold text-slate-800 text-sm">{f.bidAmount}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-secondary btn-sm">View Profile</button>
                      <button onClick={() => navigate(`/admin/messages`)}
                        className="btn-secondary btn-sm flex items-center gap-1">
                        <MessageSquare size={12} /> Talk
                      </button>
                      {project.status === 'ASSIGNMENT_PENDING' && (
                        <button
                          onClick={() => handleAssign(f.id, f.name)}
                          className={`btn-sm flex items-center gap-1 ${assignedId === f.id ? 'btn-success' : 'btn-primary'}`}
                        >
                          {assignedId === f.id
                            ? <><Check size={12} /> Assigned</>
                            : <><UserCheck size={12} /> Assign</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
