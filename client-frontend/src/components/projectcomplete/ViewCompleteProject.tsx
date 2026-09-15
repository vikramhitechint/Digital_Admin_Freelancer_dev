import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import api from "../../utils/api";

function ViewCompleteProjectContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data;
        
        const mapped = {
          ...p,
          name: p.title,
          amount: `₹${Number(p.budget).toLocaleString()}`,
          completionDate: new Date(p.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          duration: p.timeline || 'TBD',
          rating: p.rating || 0,
          review: p.review || "",
          freelancer: p.freelancers?.[0]?.freelancer ? {
            name: p.freelancers[0].freelancer.fullName
          } : { name: "Freelancer" }
        };
        setProject(mapped);
        setCurrentRating(mapped.rating);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      }
    };
    if (id) fetchProject();
  }, [id]);

  // Clickable Star Rating Handler
  const handleRateProject = (stars: number) => {
    setCurrentRating(stars);
  };

  const getFileIcon = (type: string) => {
    if (type === "link") {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handleDownload = (fileName: string) => {
    const docContent = `=====================================================
HTGE Operations - Deliverable
Project: ${project?.name}
File: ${fileName}
Downloaded: ${new Date().toLocaleString()}
=====================================================`;
    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading project details...</p>
      </div>
    );
  }

  // Fallback for completion date
  const displayCompletionDate = project.completedOn || project.completionDate || 'N/A';
  // Fallback for budget
  const displayBudget = project.amount || 'N/A';

  // Safely parse timeline
  let safeTimeline = [
    { label: "Project Published", date: "14 May 2026", time: "10:00 AM", note: "", color: "blue" },
    { label: "Freelancer started working on", date: "15 May 2026", time: "2:30 PM", note: "Payment processed", color: "blue" },
    { label: "Project Marked In Progress", date: "16 May 2026", time: "3:00 PM", note: "", color: "blue" },
    { label: "Completion Submitted", date: "01 Jul 2026", time: "5:45 PM", note: "", color: "blue" },
    { label: "Approved & Completed", date: "01 Jul 2026", time: "7:15 PM", note: "Payment released", color: "green" }
  ];

  if (project.timeline) {
    try {
      safeTimeline = typeof project.timeline === 'string' ? JSON.parse(project.timeline) : project.timeline;
    } catch (e) {
      console.error("Failed to parse timeline", e);
    }
  }

  let safeDeliverables: any[] = [];
  if (project.deliverables) {
    try {
      safeDeliverables = typeof project.deliverables === 'string' ? JSON.parse(project.deliverables) : project.deliverables;
    } catch (e) {
      console.error("Failed to parse deliverables", e);
    }
  }


  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 relative">

      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/projects/complete")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">ID: #{project.id?.slice(0,8)}</span>
          {project.freelancers?.[0]?.freelancer && (
            <button
              onClick={() =>
                navigate(`/projects/complete/${project.id}/chat/${project.freelancers[0].freelancer.id}`, {
                  state: { project, freelancer: project.freelancers[0].freelancer }
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              View Chat & Review
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP PROJECT HEADER CARD (With Clickable Stars)                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Completed successfully on {project.completedOn || project.completionDate}
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            Completed
          </span>
        </div>

        {/* 5-Column Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Freelancer</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{project.freelancer?.name || "Rahul Sharma"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Duration</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{project.duration}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Project Amount</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{displayBudget}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completion Date</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{displayCompletionDate}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rating</p>
              <span className="text-[10px] font-bold text-amber-500">
                {hoverRating || currentRating}/5
              </span>
            </div>

            {/* Clickable Star Rating */}
            <div 
              className="flex items-center gap-1 mt-1 cursor-pointer"
              onMouseLeave={() => setHoverRating(0)}
              title="Click to change rating"
            >
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isFilled = (hoverRating || currentRating) >= starNum;
                return (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => handleRateProject(starNum)}
                    onMouseEnter={() => setHoverRating(starNum)}
                    className="p-0.5 hover:scale-125 transition-transform duration-150 focus:outline-none cursor-pointer"
                  >
                    <svg
                      className={`w-4 h-4 transition-colors ${
                        isFilled
                          ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                          : "text-slate-200 fill-slate-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DELIVERABLES CARD                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Deliverables</h2>

        <div className="space-y-2">
          {safeDeliverables.length > 0 ? (
            safeDeliverables.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/30 hover:border-blue-100 transition group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getFileIcon(item.fileType)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.fileType === "link" ? (item.urlLabel || item.url) : `${item.size} • ${item.type}`}
                    </p>
                  </div>
              </div>

              {item.fileType === "link" ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition shrink-0 ml-4"
                >
                  Visit
                </a>
              ) : (
                <button
                  onClick={() => handleDownload(item.name)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition shrink-0 ml-4 cursor-pointer"
                >
                  Download
                </button>
              )}
            </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm font-semibold text-slate-500">No deliverables found.</p>
              <p className="text-xs text-slate-400">The freelancer hasn't submitted any final files yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RATING PROMPT BANNER                                                   */}
      {/* ========================================================================= */}
      {!project.rating && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Rate your freelancer!</p>
              <p className="text-blue-100 text-xs mt-0.5">Open the project chat and click <strong>"Rate & Review"</strong> to submit your feedback.</p>
            </div>
          </div>
        </div>
      )}
      {project.rating && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Your Rating</h2>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className={`w-6 h-6 ${s <= project.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="ml-2 text-sm font-bold text-slate-700">{project.rating}/5</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold">✓ Thank you for your feedback!</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACTIVITY LOG (MOCKED)                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-slate-900 p-6 pb-0">Project Timeline</h2>

        <div className="relative p-6 pt-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200"></div>

          <div className="space-y-5 relative">
            {safeTimeline.map((event: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 pl-1">
                {/* Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 z-10 ${
                    event.color === "green"
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-blue-600 border-blue-600"
                  }`}
                ></div>

                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <p className="text-xs font-semibold text-slate-900">{event.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.date} • {event.time}
                    {event.note && (
                      <span className="text-slate-500 font-medium"> • {event.note}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewCompleteProject() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => (
      <div className="p-8 text-red-600">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <pre className="bg-red-50 p-4 rounded text-sm overflow-auto">
          {(error as Error).message}
        </pre>
      </div>
    )}>
      <ViewCompleteProjectContent />
    </ErrorBoundary>
  );
}