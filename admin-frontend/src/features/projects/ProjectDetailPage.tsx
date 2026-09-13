import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, ImageIcon, Star, MessageSquare, UserCheck, Check, X, Download, Clock, IndianRupee, Calendar, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AdminChatViewer from "@/components/shared/AdminChatViewer";

const statusBadge: Record<string, string> = {
  PUBLISHED: "badge-yellow",
  PENDING_ADMIN_REVIEW: "badge-yellow",
  ASSIGNMENT_PENDING: "badge-orange",
  APPROVED: "badge-blue",
  ONGOING: "badge-blue",
  COMPLETED: "badge-green",
  DROPPED: "badge-red",
  DISPUTED: "badge-red",
};

const statusLabel: Record<string, string> = {
  PUBLISHED: "Pending Review",
  PENDING_ADMIN_REVIEW: "Pending Review",
  ASSIGNMENT_PENDING: "Assignment Pending",
  APPROVED: "Approved",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  DISPUTED: "Disputed",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [assignedFreelancerId, setAssignedFreelancerId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.put(`/projects/${project.id}/approve`);
      toast.success(`Project "${project.title}" approved!`);
      fetchProject();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setApproving(false);
    }
  };

  const handleAssign = async (freelancerId: string, name: string) => {
    setAssignedFreelancerId(freelancerId);
    try {
      await api.put(`/projects/${project.id}/assign`, { freelancerIds: [freelancerId] });
      toast.success(`${name} has been assigned to this project!`);
      fetchProject();
    } catch {
      toast.error("Failed to assign freelancer");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">Project not found.</p>
      </div>
    );
  }

  // Derive display values from real backend data
  const budget = project.budget ? `${Number(project.budget).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}` : "N/A";
  const timeline = project.timeline || "N/A";
  const approaches = project.freelancers?.length || 0;
  const freelancerAssignedIds: string[] = project.freelancerAssignedIds || [];
  const primaryFreelancerId = freelancerAssignedIds[0] || "";

  // Parse deliverables
  let deliverables: any[] = [];
  try {
    deliverables = typeof project.deliverables === "string" ? JSON.parse(project.deliverables) : (project.deliverables || []);
  } catch { /**/ }

  // Parse timeline events
  let timelineEvents: any[] = [];
  try {
    timelineEvents = typeof project.timelineEvents === "string" ? JSON.parse(project.timelineEvents) : (project.timelineEvents || []);
  } catch { /**/ }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate("/admin/projects")} className="btn-secondary btn-sm flex items-center gap-1 mt-1">
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="page-title">{project.title}</h1>
              <span className={`badge ${statusBadge[project.status] ?? "badge-slate"}`}>
                {statusLabel[project.status] ?? project.status}
              </span>
            </div>
            <p className="page-subtitle">
              Posted {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {project.client?.fullName || project.client?.name || "Client"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(project.status === "PUBLISHED" || project.status === "PENDING_ADMIN_REVIEW") && (
            <>
              <button onClick={handleApprove} disabled={approving} className="btn-success flex items-center gap-1.5">
                <Check size={14} /> {approving ? "Approving..." : "Approve"}
              </button>
              <button className="btn-danger flex items-center gap-1.5">
                <X size={14} /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => setShowChat(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <MessageSquare size={14} /> Open Chat
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: IndianRupee, label: "Budget", value: budget, color: "#2563EB" },
          { icon: Clock, label: "Timeline", value: timeline, color: "#F59E0B" },
          { icon: Users, label: "Approaches", value: approaches > 0 ? `${approaches} bids` : "None yet", color: "#10B981" },
          { icon: Calendar, label: "Status", value: statusLabel[project.status] ?? project.status, color: "#7C3AED" },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.color + "15" }}>
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
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Project Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{project.description || "No description provided."}</p>
          </div>

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((s: string) => (
                  <span key={s} className="badge badge-blue text-xs px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Deliverables</h3>
              <div className="space-y-2">
                {deliverables.map((d: any) => (
                  <div key={d.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {d.fileType === "link" ? <ExternalLink size={14} className="text-blue-600" /> : <FileText size={14} className="text-slate-600" />}
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

          {/* Google Drive Link */}
          {project.googleDriveLink && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Project Drive</h3>
              <a href={project.googleDriveLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold">
                <ExternalLink size={14} /> Open in Google Drive
              </a>
            </div>
          )}

          {/* Timeline */}
          {timelineEvents.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Project Timeline</h3>
              <div className="space-y-0">
                {timelineEvents.map((t: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${t.color === "green" ? "bg-emerald-500 border-emerald-500" : "bg-blue-500 border-blue-500"}`} />
                      {i < timelineEvents.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: "28px" }} />}
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

        {/* Right: Project Brief + Rating */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Project Brief</h3>
            <div className="space-y-3">
              {[
                { label: "Company", value: project.client?.fullName || project.client?.name || "—" },
                { label: "Budget", value: budget },
                { label: "Deadline", value: project.completionDate || timeline },
                { label: "Status", value: statusLabel[project.status] ?? project.status },
                { label: "Completion %", value: `${project.completionPercentage || 0}%` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Rating if completed */}
          {project.rating && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Client Rating</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={20} className={s <= project.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                ))}
                <span className="text-sm font-bold text-slate-700 ml-1">{project.rating}.0</span>
              </div>
              {project.review && (
                <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-100 pt-2">"{project.review}"</p>
              )}
            </div>
          )}

          {/* Chat CTA */}
          <button
            onClick={() => setShowChat(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm"
          >
            <MessageSquare size={15} /> View Project Chat
          </button>
        </div>
      </div>

      {/* Freelancer Approaches Table */}
      {project.freelancers && project.freelancers.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Freelancer Approaches</h3>
            <p className="text-xs text-slate-400 mt-0.5">{project.freelancers.length} freelancers have approached on this project</p>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name & Skill</th>
                <th>Role</th>
                <th>Rating</th>
                <th>Total Completion</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.freelancers.map((f: any, i: number) => (
                <tr key={f.id} className={assignedFreelancerId === f.id ? "bg-emerald-50" : ""}>
                  <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar avatar-md font-bold text-xs bg-blue-100 text-blue-700">
                        {(f.fullName || f.name || "F").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{f.fullName || f.name}</p>
                        <p className="text-[11px] text-slate-400">+freelancer</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-slate">Freelancer</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{f.rating || "—"}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">{f.completedProjects || 0} projects</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-secondary btn-sm">View Profile</button>
                      <button
                        onClick={() => setShowChat(true)}
                        className="btn-secondary btn-sm flex items-center gap-1"
                      >
                        <MessageSquare size={12} /> Talk
                      </button>
                      {(project.status === "ASSIGNMENT_PENDING" || project.status === "PUBLISHED" || project.status === "APPROVED") && (
                        <button
                          onClick={() => handleAssign(f.id, f.fullName || f.name)}
                          className={`btn-sm flex items-center gap-1 ${assignedFreelancerId === f.id ? "btn-success" : "btn-primary"}`}
                        >
                          {assignedFreelancerId === f.id ? <><Check size={12} /> Assigned</> : <><UserCheck size={12} /> Assign</>}
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

      {/* Admin Chat Viewer Modal */}
      {showChat && (
        <AdminChatViewer
          project={project}
          freelancerId={primaryFreelancerId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
