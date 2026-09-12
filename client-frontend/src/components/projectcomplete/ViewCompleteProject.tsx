import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ViewCompleteProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [savedToast, setSavedToast] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data;
        
        // Find if rating is stored in local storage for demo
        const savedProjects = JSON.parse(localStorage.getItem("htge_completed_projects") || "[]");
        const savedData = savedProjects.find((sp: any) => String(sp.id) === String(id));

        const mapped = {
          ...p,
          name: p.title,
          amount: `₹${Number(p.budget).toLocaleString()}`,
          completionDate: new Date(p.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          duration: "1 month", // Mocked
          rating: savedData ? savedData.rating : 5,
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

  // Clickable Star Rating Handler (Updates localStorage and reflects in list table)
  const handleRateProject = (stars: number) => {
    setCurrentRating(stars);

    const savedProjects: any[] =
      JSON.parse(localStorage.getItem("htge_completed_projects") || "[]");

    let found = false;
    const updatedProjects = savedProjects.map((p) => {
      if (String(p.id) === String(project?.id)) {
        found = true;
        return { ...p, rating: stars };
      }
      return p;
    });

    if (!found && project) {
      updatedProjects.push({ id: project.id, rating: stars });
    }

    localStorage.setItem("htge_completed_projects", JSON.stringify(updatedProjects));
    setProject((prev: any) => (prev ? { ...prev, rating: stars } : prev));

    // Toast alert
    setSavedToast(`Rating updated to ${stars} Star${stars > 1 ? "s" : ""}!`);
    setTimeout(() => setSavedToast(""), 2200);
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

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 relative">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500 animate-bounce">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
          {savedToast}
        </div>
      )}

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
        <span className="text-xs font-mono text-slate-400">ID: #{project.id}</span>
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
            <p className="text-sm font-bold text-slate-900 mt-1">{project.amount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completion Date</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{project.completionDate}</p>
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
          {(project.deliverables || [
            { name: "Dashboard_Final.fig", size: "2.5 MB", type: "Figma", fileType: "file" },
            { name: "Design_Specs_&_Component_Library.pdf", size: "1.2 MB", type: "PDF", fileType: "file" },
            { name: "Drive Link", url: "https://figma.com/design/abc123", urlLabel: "https://figma.com/design/abc123", fileType: "link" }
          ]).map((item: any, idx: number) => (
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
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT TIMELINE CARD                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Project Timeline</h2>

        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200"></div>

          <div className="space-y-5 relative">
            {(project.timeline || [
              { label: "Project Published", date: "14 May 2026", time: "10:00 AM", note: "", color: "blue" },
              { label: "Freelancer started working on", date: "15 May 2026", time: "2:30 PM", note: "Payment processed", color: "blue" },
              { label: "Project Marked In Progress", date: "16 May 2026", time: "3:00 PM", note: "", color: "blue" },
              { label: "Completion Submitted", date: "01 Jul 2026", time: "5:45 PM", note: "", color: "blue" },
              { label: "Approved & Completed", date: "01 Jul 2026", time: "7:15 PM", note: "Payment released", color: "green" }
            ]).map((event: any, idx: number) => (
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