import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ViewProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [selectedFreelancerProfile, setSelectedFreelancerProfile] = useState<any>(null);
  const [downloadToast, setDownloadToast] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        // Map backend response to frontend UI properties
        const p = res.data;
        const mapped = {
          ...p,
          name: p.title,
          amount: `₹${Number(p.budget).toLocaleString()}`,
          postedDate: new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          freelancerApproaches: p.freelancers?.map((f: any) => ({
            id: f.freelancer.id,
            name: f.freelancer.fullName,
            subtitle: f.freelancer.role || 'Freelancer',
            role: f.freelancer.role || 'Freelancer',
            rating: "4.8", // Mocked
            completed: 10, // Mocked
            bidAmount: p.budget,
            avatarBg: "bg-blue-100 text-blue-700",
            avatarInitials: f.freelancer.fullName.charAt(0),
            email: f.freelancer.email,
            experience: "3+ years", // Mocked
            bio: f.freelancer.skills?.join(', ') || 'Professional freelancer',
          })) || []
        };
        setProject(mapped);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      }
    };
    if (id) fetchProject();
  }, [id]);

  // Navigate to direct chat with freelancer (ONLY via Talk button)
  const handleOpenChat = (freelancer: any) => {
    navigate(`/projects/publish/${project?.id || "01"}/chat/${freelancer.id}`, {
      state: { project, freelancer }
    });
  };

  // Real Browser File Download Handler
  const handleDownloadFile = (fileName: string) => {
    let blob;
    if (fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#F8FAFC" rx="16"/>
        <rect x="40" y="40" width="720" height="80" fill="#2563EB" rx="12"/>
        <text x="70" y="88" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">HTGE Operations Mockup - ${fileName}</text>
        <rect x="40" y="150" width="340" height="280" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="12"/>
        <rect x="420" y="150" width="340" height="280" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="12"/>
        <text x="70" y="200" font-family="sans-serif" font-size="16" fill="#1E293B">Sample UI Wireframe Content</text>
        <text x="450" y="200" font-family="sans-serif" font-size="16" fill="#1E293B">Deliverables & Specs</text>
      </svg>`;
      blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    } else {
      const docContent = `=====================================================
HTGE Operations - Project Specification Document
Project: ${project?.name || "Project Details"}
File: ${fileName}
Generated: ${new Date().toLocaleString()}
=====================================================
Scope, APIs, Milestones & Acceptance Criteria.
`;
      blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Downloading "${fileName}"...`);
    setTimeout(() => setDownloadToast(""), 3000);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading project details...</p>
      </div>
    );
  }

  // Safe fallbacks to guarantee rich display
  const skills = project.skills?.length > 0 ? project.skills : ["React", "Node.js", "Tailwind CSS"];

  const sampleLinks = project.sampleLinks?.length > 0 ? project.sampleLinks : [
    { label: "Figma Prototype", url: "https://figma.com/@htge-project" },
    { label: "Specification Document", url: "https://docs.htge.in" }
  ];

  const sampleImages = project.sampleImages?.length > 0 ? project.sampleImages : [
    { name: "dashboard_wireframe.png", size: "1.4 MB", type: "image" },
    { name: "project_scope_spec.pdf", size: "620 KB", type: "doc" }
  ];

  const approaches = project.freelancerApproaches?.length > 0 ? project.freelancerApproaches : [
    {
      id: 1,
      name: "Rahul Sharma",
      subtitle: "React Developer",
      role: "Frontend",
      rating: "4.8",
      completed: 24,
      bidAmount: project.amount,
      avatarBg: "bg-blue-100 text-blue-700",
      avatarInitials: "RS",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      email: "rahul.sharma@example.com",
      experience: "5+ years",
      bio: "Specialized in responsive UI engineering and modular React components."
    },
    {
      id: 2,
      name: "Priya Nair",
      subtitle: "UI/UX Designer",
      role: "Designer",
      rating: "4.9",
      completed: 18,
      bidAmount: project.amount,
      avatarBg: "bg-teal-100 text-teal-700",
      avatarInitials: "PN",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
      email: "priya.nair@example.com",
      experience: "4 years",
      bio: "Design system specialist and Figma component expert."
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-white border-blue-200 text-slate-800 animate-slide-up">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
            ↓
          </div>
          <span className="text-xs font-medium text-slate-700">{downloadToast}</span>
        </div>
      )}

      {/* Top Back Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/projects/publish")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
        <span className="text-xs font-mono text-slate-400">ID: #{project.id}</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP CARD: PROJECT DETAILS                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {project.postedDate?.includes("Posted") ? project.postedDate : `Posted ${project.postedDate || "02 Aug 2026"}`} •{" "}
            <span className="text-slate-600 font-medium">Active</span>
          </p>
        </div>

        {/* 4-Column Horizontal Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-5 border-y border-slate-100">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget Range</p>
            <p className="text-lg font-serif font-bold text-slate-900 mt-1">{project.amount}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Approaches</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{approaches.length}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completion Date</p>
            <p className="text-lg font-medium text-slate-900 mt-1">{project.completionDate || "15 Feb 2025"}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">Active</p>
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Project Description</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{project.description || "Comprehensive platform enhancement and redesign with modern component architecture, real-time metrics, and performance optimizations."}</p>
        </div>

        {/* Required Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample Links */}
        {sampleLinks.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sample Links</h3>
            <div className="flex flex-wrap gap-3">
              {sampleLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-xs font-medium text-blue-600 rounded-xl transition shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Sample Docs & Downloadable Images */}
        {sampleImages.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sample Docs & Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleImages.map((file: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleDownloadFile(file.name)}
                  className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-xs"
                  title="Click to Download"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {file.type === "doc" ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{file.size}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(file.name);
                    }}
                    className="text-slate-400 group-hover:text-blue-600 p-1.5 rounded-lg hover:bg-white transition"
                    title="Download file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM CARD: FREELANCER APPROACHES                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Freelancer <span className="font-serif font-bold">Approaches</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {approaches.length} freelancers have approaches on this project
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">S.No</th>
                <th className="py-3.5 px-6">Name & Skill</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Total Completion</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {approaches.length > 0 ? (
                approaches.map((f: any) => (
                  <tr key={f.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500 font-medium">{f.id}</td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${f.avatarBg}`}
                        >
                          {f.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{f.name}</p>
                          <p className="text-[11px] text-slate-500">{f.subtitle}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700">{f.role}</td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{f.rating}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700">{f.completed}</td>

                    {/* Action Buttons: View Profile and Talk */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Profile Button: Opens Modal Only */}
                        <button
                          onClick={() => setSelectedFreelancerProfile(f)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-xs cursor-pointer"
                        >
                          View Profile
                        </button>

                        {/* Talk Button: The ONLY button that opens the Chat */}
                        <button
                          onClick={() => handleOpenChat(f)}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition shadow-xs shadow-blue-500/20 cursor-pointer"
                        >
                          Talk
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No freelancer approaches received yet for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FREELANCER USER PROFILE MODAL (Only View & Close, No Chat)             */}
      {/* ========================================================================= */}
      {selectedFreelancerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${selectedFreelancerProfile.avatarBg}`}
                  >
                    {selectedFreelancerProfile.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedFreelancerProfile.name}</h3>
                    <p className="text-xs text-slate-500">{selectedFreelancerProfile.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFreelancerProfile(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedFreelancerProfile.bio}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Experience</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedFreelancerProfile.experience}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Completed Projects</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedFreelancerProfile.completed} projects</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Only 'Close' button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedFreelancerProfile(null)}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}