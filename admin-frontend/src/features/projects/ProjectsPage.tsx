import React, { useState } from 'react';
import { 
  Search, Eye, MessageCircle, UserPlus, FileText, CheckCircle, Clock, Link as LinkIcon, Image as ImageIcon, X, Play, FileCheck, ThumbsUp, Users, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Mock Data
type Project = {
  id: string; 
  title: string; 
  companyName: string; 
  status: 'Published' | 'Ongoing' | 'Completed';
  budget: string;
  submittedDate: string;
  freelancerAssigned: string[]; // Changed to array for multiple freelancers
  references?: number;
  description?: string;
  timeline?: string;
};

const mapProject = (p: any): Project => ({
  id: p.id,
  title: p.title,
  companyName: p.client?.profile?.companyName || p.client?.fullName || 'Unknown Client',
  status: (p.status.charAt(0) + p.status.slice(1).toLowerCase()) as any,
  budget: `₹${Number(p.budget).toLocaleString()}`,
  submittedDate: new Date(p.createdAt).toLocaleDateString(),
  freelancerAssigned: p.freelancers?.map((f: any) => f.freelancer.fullName) || [],
  freelancerAssignedIds: p.freelancers?.map((f: any) => f.freelancer.id) || [],
  references: p.assets?.length || 0,
  description: p.description,
  timeline: p.timeline
});

type TabType = 'Published' | 'Ongoing' | 'Completed';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Published');
  const [projects, setProjects] = useState<Project[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, freeRes] = await Promise.all([
        api.get('/admin/projects'),
        api.get('/admin/freelancers')
      ]);
      setProjects(projRes.data.map(mapProject));
      setFreelancers(freeRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  // Modal States
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [talkProject, setTalkProject] = useState<Project | null>(null);
  
  // Assignment State
  const [assignProject, setAssignProject] = useState<Project | null>(null);
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);

  const filteredProjects = projects.filter(p => p.status === activeTab);

  const handleTalk = (project: Project) => {
    setTalkProject(project);
  };

  const handleView = (project: Project) => {
    setViewProject(project);
  };

  const handleAssignClick = (project: Project) => {
    setAssignProject(project);
    // Use freelancerAssignedIds if available, fallback to empty
    setSelectedFreelancers((project as any).freelancerAssignedIds || []);
  };

  const toggleFreelancerSelection = (name: string) => {
    if (selectedFreelancers.includes(name)) {
      setSelectedFreelancers(selectedFreelancers.filter(f => f !== name));
    } else {
      setSelectedFreelancers([...selectedFreelancers, name]);
    }
  };

  const confirmAssignment = async () => {
    if (!assignProject) return;
    
    try {
      await api.put(`/projects/${assignProject.id}/assign`, { freelancerIds: selectedFreelancers });
      toast.success(`Successfully assigned ${selectedFreelancers.length} freelancer(s)`);
      setAssignProject(null);
      fetchData();
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  // Workflow Actions
  const handleMoveToOngoing = async () => {
    if (!talkProject) return;
    try {
      await api.put(`/projects/${talkProject.id}/status`, { status: 'ONGOING' });
      toast.success("Project approved. Amount released to Escrow. Moved to Ongoing.");
      setTalkProject(null);
      setActiveTab('Ongoing');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve project');
    }
  };

  const handleSendCompletionRequest = async () => {
    if (!talkProject) return;
    toast.loading("Sending Google Drive link to client...", { duration: 1500 });
    setTimeout(async () => {
      try {
        await api.put(`/projects/${talkProject.id}/status`, { status: 'COMPLETED' });
        toast.success("Client accepted the completion request! Project marked as Completed.");
        setTalkProject(null);
        setActiveTab('Completed');
        fetchData();
      } catch (err) {
        toast.error('Failed to complete project');
      }
    }, 1500);
  };

  const handleApproveWork = () => {
    toast.success("Progress approved and updated!");
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA] relative text-base">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Oversee published requirements, active milestones, and completed deliveries.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition" 
              placeholder="Search projects..." 
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="flex border-b border-slate-200">
          {(['Published', 'Ongoing', 'Completed'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-8 text-lg font-bold transition-all relative ${
                activeTab === tab 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-slate-900 font-bold text-2xl">No {activeTab} Projects</h3>
              <p className="text-slate-500 text-lg mt-2">There are currently no projects in this stage.</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        {project.companyName}
                      </span>
                      <span className="text-sm font-mono text-slate-400">{project.id}</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4" /> Submitted {project.submittedDate}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{project.title}</h2>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm font-semibold text-slate-600">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        <span>{project.references || 0} Attached Assets</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition">
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">View Client Brief</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-4 flex-wrap justify-end">
                    <div className="text-right mr-6">
                      <div className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Escrow Budget</div>
                      <div className="text-xl font-black text-slate-900 font-mono">{project.budget}</div>
                    </div>

                    <button 
                      onClick={() => handleView(project)}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-base font-bold transition shadow-sm"
                    >
                      <Eye className="w-5 h-5 text-slate-500" />
                      <span>View Details</span>
                    </button>

                    {activeTab === 'Published' && (
                      <>
                        <button 
                          onClick={() => handleAssignClick(project)}
                          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-base font-bold shadow-sm transition"
                        >
                          <UserPlus className="w-5 h-5" />
                          <span>{project.freelancerAssigned.length > 0 ? 'Edit Assignment' : 'Assign Freelancers'}</span>
                        </button>
                        
                        {/* Only show TALK if freelancers are assigned */}
                        {project.freelancerAssigned.length > 0 && (
                          <button 
                            onClick={() => handleTalk(project)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-transparent text-white hover:bg-blue-700 rounded-lg text-base font-bold shadow-sm transition"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>Talk & Approve</span>
                          </button>
                        )}
                      </>
                    )}

                    {activeTab === 'Ongoing' && (
                      <>
                        <button 
                          onClick={() => handleTalk(project)}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-transparent text-white hover:bg-blue-700 rounded-lg text-base font-bold shadow-sm transition"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Talk & Update Progress</span>
                        </button>
                      </>
                    )}

                    {activeTab === 'Completed' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-base font-bold border border-emerald-100">
                        <CheckCircle className="w-5 h-5" />
                        Settled & Closed
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* VIEW MODAL */}
      {viewProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Project Master Dossier</h2>
                <div className="text-sm text-slate-500 font-medium mt-1">ID: {viewProject.id} | Status: {viewProject.status}</div>
              </div>
              <button onClick={() => setViewProject(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-2 border border-slate-200 shadow-sm transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Core Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Company / Client</div>
                    <div className="text-xl font-bold text-slate-900">{viewProject.companyName}</div>
                  </div>
                  <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                    <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Escrow Budget</div>
                    <div className="text-xl font-black text-emerald-700 font-mono">{viewProject.budget}</div>
                  </div>
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                    <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Timeline</div>
                    <div className="text-xl font-bold text-blue-700">{viewProject.timeline || 'TBD'}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Requirement Brief</h3>
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-700 text-lg leading-relaxed shadow-sm">
                  {viewProject.description || 'No detailed description provided by the client.'}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Provided Assets & References</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(viewProject.references || 2)].map((_, i) => (
                    <div key={i} className="group relative bg-slate-100 rounded-xl border border-slate-200 aspect-video flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-colors">
                      <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">Reference_{i+1}.png</span>
                    </div>
                  ))}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 border-dashed aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                    <LinkIcon className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-bold text-blue-700">Figma Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TALK / CHAT MODAL */}
      {talkProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{talkProject.companyName}</h2>
                  <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <span>Re: {talkProject.title}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider">{talkProject.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Contextual Action Buttons */}
                {talkProject.status === 'Published' && (
                  <button onClick={handleMoveToOngoing} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    Approve & Release Escrow
                  </button>
                )}
                {talkProject.status === 'Ongoing' && (
                  <button onClick={handleSendCompletionRequest} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                    Send Completion Request (GDrive)
                  </button>
                )}

                <button onClick={() => setTalkProject(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2 transition ml-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Chat Area */}
              <div className="flex-1 flex flex-col bg-[#F8FAFC] border-r border-slate-200 relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                  <div className="flex justify-center">
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full uppercase tracking-wider">Project Talk Space Initiated</span>
                  </div>
                  
                  {/* Client Message */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0 mt-1 shadow-sm flex items-center justify-center font-bold text-slate-600">C</div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm text-base text-slate-700 shadow-sm max-w-xl">
                      <p className="font-bold text-slate-900 mb-1">{talkProject.companyName}</p>
                      We have published our requirement and the escrow is ready. Please allocate the best freelancers.
                    </div>
                  </div>

                  {/* System Indication */}
                  {talkProject.freelancerAssigned.length > 0 && (
                    <div className="flex justify-center">
                      <span className="text-xs font-bold bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full">
                        Admin allocated {talkProject.freelancerAssigned.length} freelancer(s) to this project.
                      </span>
                    </div>
                  )}

                  {/* Freelancer approaching Client */}
                  {talkProject.freelancerAssigned.length > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex-shrink-0 mt-1 shadow-sm flex items-center justify-center text-emerald-700 font-bold">F</div>
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm text-base text-slate-700 shadow-sm max-w-xl">
                        <p className="font-bold text-emerald-700 mb-1">{talkProject.freelancerAssigned[0] || 'Freelancer'} <span className="text-slate-400 font-normal text-sm ml-2">approached the client</span></p>
                        Hi team, I have reviewed your requirements and I am fully equipped to handle this. I can start immediately.
                      </div>
                    </div>
                  )}
                  
                  {/* Admin Message */}
                  <div className="flex items-start gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 mt-1 flex items-center justify-center text-sm text-white font-bold shadow-sm">A</div>
                    <div className="bg-blue-600 p-5 rounded-2xl rounded-tr-sm text-base text-white shadow-sm max-w-xl">
                      <p className="font-bold text-blue-100 mb-1">You (Digital Freelancer Admin)</p>
                      Hello {talkProject.companyName}, I have assigned our top talent to this project. You can communicate with them directly here. Once you are comfortable, I will approve and release the escrow so work can begin.
                    </div>
                  </div>

                  {/* System Update / Approval (If Ongoing) */}
                  {talkProject.status === 'Ongoing' && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex-shrink-0 mt-1 flex items-center justify-center shadow-sm">
                        <FileCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl rounded-tl-sm text-base text-indigo-900 shadow-sm max-w-xl">
                        <p className="font-bold text-indigo-700 mb-2 uppercase tracking-wide text-sm">Update Received</p>
                        <p className="mb-3">The freelancer has submitted an update. Please review the progress.</p>
                        <button onClick={handleApproveWork} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                          <ThumbsUp className="w-4 h-4" /> Acknowledge Progress
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Message the client or freelancer on behalf of Admin..." 
                      className="flex-1 px-6 py-4 bg-slate-50 border border-slate-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-md shrink-0">
                      <Play className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Area (Allocated Freelancers & Progress) */}
              <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-6 overflow-y-auto flex-1">
                  
                  {/* Allocated Freelancers Section */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      Allocated Freelancers ({talkProject.freelancerAssigned.length})
                    </h3>
                    {talkProject.freelancerAssigned.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No freelancers assigned yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {talkProject.freelancerAssigned.map((name, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                              {name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Work Progress Section (Only for Ongoing/Completed) */}
                  {talkProject.status !== 'Published' && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Work Progress</h3>
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-600" strokeDasharray="65, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                          <div className="absolute text-3xl font-black text-slate-900">65%</div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-wider">Overall Completion</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Milestones</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-semibold text-slate-700 line-through">Architecture</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-semibold text-slate-700 line-through">Database Schema</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-bold text-blue-700">API Endpoints</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                            <span className="text-sm font-medium text-slate-500">Frontend Integration</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Assign Freelancer Modal */}
      {assignProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Assign Freelancers</h2>
                  <div className="text-base text-slate-500 mt-1 font-medium">Select verified freelancers for {assignProject.title}</div>
                </div>
                <button onClick={() => setAssignProject(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-2 border border-slate-200 shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm" 
                  placeholder="Search by name, role, or skills..." 
                />
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="space-y-4">
                {freelancers.map(freelancer => {
                  const isSelected = selectedFreelancers.includes(freelancer.id);
                  return (
                    <div 
                      key={freelancer.id} 
                      onClick={() => toggleFreelancerSelection(freelancer.id)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400'} rounded-xl cursor-pointer transition-all gap-4`}
                    >
                      <div className="flex items-start gap-5">
                        {/* Checkbox representation */}
                        <div className={`mt-2 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        
                        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xl border border-slate-200 shrink-0 mt-0">
                          {freelancer.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">{freelancer.fullName}</h3>
                          <p className="text-base font-medium text-slate-500 mb-3">{freelancer.profile?.title || 'Freelancer'}</p>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.profile?.skills?.map((skill: string) => (
                              <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action */}
            <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">
                {selectedFreelancers.length} Freelancer(s) Selected
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setAssignProject(null)}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAssignment}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl border border-transparent hover:bg-blue-700 transition shadow-md"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
