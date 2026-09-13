import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, MessageCircle, UserPlus, FileText, CheckCircle, Clock, Link as LinkIcon, Image as ImageIcon, X, Play, FileCheck, ThumbsUp, Users, ArrowRight, RefreshCw
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
  freelancerAssignedIds: string[];
  references?: number;
  description?: string;
  timeline?: string;
  completionPercentage?: number;
  googleDriveLink?: string;
  rating?: number;
  review?: string;
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
  timeline: p.timeline,
  completionPercentage: p.completionPercentage || 0,
  googleDriveLink: p.googleDriveLink || '',
  rating: p.rating,
  review: p.review
});

type TabType = 'Published' | 'Ongoing' | 'Completed' | 'Dropped';

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
      setProjects(projRes.data.data.map(mapProject));
      setFreelancers(freeRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  // Modal States
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [talkProject, setTalkProject] = useState<Project | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Progress State
  const [progress, setProgress] = useState(0);
  const [driveLink, setDriveLink] = useState('');
  
  // Assignment State
  const [assignProject, setAssignProject] = useState<Project | null>(null);
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);
  
  // Chat Impersonation State
  const [selectedChatFreelancerId, setSelectedChatFreelancerId] = useState<string>('');

  const filteredProjects = projects.filter(p => p.status === activeTab);

  const handleTalk = (project: Project) => {
    setTalkProject(project);
    setProgress(project.completionPercentage || 0);
    setDriveLink(project.googleDriveLink || '');
    if (project.freelancerAssignedIds?.length > 0) {
      setSelectedChatFreelancerId(project.freelancerAssignedIds[0]);
    } else {
      setSelectedChatFreelancerId('');
    }
    fetchMessages(project.id);
  };

  const fetchMessages = async (projectId: string, fId?: string) => {
    try {
      const url = fId ? `/messages/${projectId}?freelancerId=${fId}` : `/messages/${projectId}`;
      const res = await api.get(url);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  useEffect(() => {
    let intervalId: any;
    if (talkProject) {
      // Fetch immediately
      fetchMessages(talkProject.id, selectedChatFreelancerId);
      
      // Auto-poll every 3 seconds
      intervalId = setInterval(() => {
        fetchMessages(talkProject.id, selectedChatFreelancerId);
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [talkProject, selectedChatFreelancerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talkProject || !newMessage.trim()) return;

    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send the message as');
      return;
    }

    try {
      const res = await api.post(`/messages/${talkProject.id}`, {
        content: newMessage,
        senderId: selectedChatFreelancerId,
        freelancerId: selectedChatFreelancerId
      });
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setNewMessage('');
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
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
  const handleSendPaymentRequest = async () => {
    if (!talkProject) return;
    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send as');
      return;
    }
    try {
      // Send payment request card to client chat
      const amount = talkProject.budget; // e.g. "₹10,000"
      await api.post(`/messages/${talkProject.id}`, {
        content: `PAYMENT_REQUEST_PAYLOAD|${amount}|${talkProject.title}`,
        senderId: selectedChatFreelancerId,
        freelancerId: selectedChatFreelancerId
      });
      setMessages(prev => [...prev, { text: `PAYMENT_REQUEST_PAYLOAD|${amount}|${talkProject.title}`, sender: 'Admin', senderId: selectedChatFreelancerId, time: '' }]);
      toast.success('Payment request sent to client!');
      fetchMessages(talkProject.id, selectedChatFreelancerId);
    } catch (err) {
      toast.error('Failed to send payment request');
    }
  };

  const handleRejectProject = async () => {
    if (!talkProject) return;
    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send as');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this project?')) return;
    try {
      await api.post(`/messages/${talkProject.id}`, {
        content: `PROJECT_REJECTED_PAYLOAD|${talkProject.title}`,
        senderId: selectedChatFreelancerId,
        freelancerId: selectedChatFreelancerId
      });
      toast.success('Project rejected and client notified.');
      setTalkProject(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to reject project');
    }
  };

  const handleMoveToOngoing = async () => {
    if (!talkProject) return;
    try {
      await api.put(`/projects/${talkProject.id}/status`, { status: 'ONGOING' });
      toast.success('Project moved to Ongoing!');
      setTalkProject(null);
      setActiveTab('Ongoing');
      fetchData();
    } catch (err) {
      toast.error('Failed to move to ongoing');
    }
  };

  const handleSendCompletionRequest = async () => {
    if (!talkProject) return;
    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send the message as');
      return;
    }
    toast.loading("Updating progress and sending Google Drive link...", { duration: 1500 });
    setTimeout(async () => {
      try {
        await api.put(`/projects/${talkProject.id}/progress`, {
          completionPercentage: progress,
          googleDriveLink: driveLink
        });

        const res = await api.post(`/messages/${talkProject.id}`, {
          content: `Work progress is 100%. Here is the Google Drive link: ${driveLink}`,
          senderId: selectedChatFreelancerId,
          freelancerId: selectedChatFreelancerId
        });
        
        if (res.data.success) {
          setMessages(prev => [...prev, res.data.data]);
        }

        toast.success("Progress updated! Now wait for client approval in chat.");
        fetchData();
      } catch (err) {
        toast.error('Failed to update progress');
      }
    }, 1500);
  };

  const handleMarkAsCompleted = async () => {
    if (!talkProject) return;
    try {
      await api.put(`/projects/${talkProject.id}/status`, { status: 'COMPLETED' });
      toast.success("Project officially marked as Completed!");
      setTalkProject(null);
      setActiveTab('Completed');
      fetchData();
    } catch (err) {
      toast.error('Failed to complete project');
    }
  };

  const handleApproveWork = () => {
    toast.success("Progress approved and updated!");
  };

  const handleRevertToOngoing = async () => {
    if (!talkProject) return;
    try {
      await api.put(`/projects/${talkProject.id}/status`, { status: 'ONGOING' });
      toast.success("Project updated and moved back to Ongoing.");
      setTalkProject(null);
      setActiveTab('Ongoing');
      fetchData();
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleSendLink = async () => {
    if (!talkProject) return;
    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send the message as');
      return;
    }
    if (!driveLink) {
      toast.error('Please enter a link');
      return;
    }
    
    try {
      await api.put(`/projects/${talkProject.id}/progress`, {
        completionPercentage: progress,
        googleDriveLink: driveLink
      });

      const res = await api.post(`/messages/${talkProject.id}`, {
        content: `DELIVERABLE_LINK_PAYLOAD|${driveLink}`,
        senderId: selectedChatFreelancerId,
        freelancerId: selectedChatFreelancerId
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
      }

      toast.success("Link sent to chat!");
      fetchData();
    } catch (err) {
      toast.error('Failed to send link');
    }
  };

  const handleUpdateProgress = async () => {
    if (!talkProject) return;
    if (!selectedChatFreelancerId) {
      toast.error('Please select a freelancer to send the message as');
      return;
    }
    try {
      await api.put(`/projects/${talkProject.id}/progress`, {
        completionPercentage: progress,
        googleDriveLink: driveLink
      });

      const messageContent = driveLink
        ? `Work progress updated to ${progress}%. Here is the link: ${driveLink}`
        : `Work progress updated to ${progress}%.`;

      const res = await api.post(`/messages/${talkProject.id}`, {
        content: messageContent,
        senderId: selectedChatFreelancerId,
        freelancerId: selectedChatFreelancerId
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
      }

      toast.success("Project progress updated and sent to chat!");
      fetchData(); // Refresh list so new percentages are stored
    } catch (err) {
      toast.error("Failed to update progress");
    }
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
          {(['Published', 'Ongoing', 'Completed', 'Dropped'] as TabType[]).map(tab => (
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
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          {/* View Chat button for completed projects */}
                          <button
                            onClick={() => handleTalk(project)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold shadow-sm transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            View Chat & Review
                          </button>
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                            <CheckCircle className="w-4 h-4" />
                            Settled & Closed
                          </div>
                        </div>
                        {project.rating && (
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-lg ${s <= project.rating! ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                            ))}
                            <span className="text-sm font-bold text-slate-600 ml-1">{project.rating}/5</span>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'Dropped' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 rounded-lg text-base font-bold border border-red-100">
                        <X className="w-5 h-5" />
                        Project Dropped
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendPaymentRequest}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Request Payment
                    </button>
                    <button
                      onClick={handleRejectProject}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-600 transition shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                {talkProject.status === 'Completed' && (
                  <button onClick={handleRevertToOngoing} className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-700 transition shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                    Update Project (Back to Ongoing)
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
                  
                  {/* Dynamic Messages Map */}
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === selectedChatFreelancerId;
                    return (
                      <div key={msg.id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 mt-1 flex items-center justify-center font-bold shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                          {msg.sender?.charAt(0) || 'U'}
                        </div>
                        <div className={`p-5 rounded-2xl text-base shadow-sm max-w-xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                          <p className={`font-bold mb-1 ${isMe ? 'text-blue-100' : 'text-slate-900'}`}>
                            {msg.sender}
                          </p>
                          {(() => {
                            // CLIENT APPROVAL REQUEST card
                            if (msg.text && msg.text.startsWith('CLIENT_APPROVAL_REQUEST|')) {
                              const projectTitle = msg.text.split('|')[1] || talkProject?.title;
                              return (
                                <div className="mt-2 rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
                                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                      <ThumbsUp className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-sm">Client Approved the Deliverables</h4>
                                      <p className="text-emerald-100 text-xs">{projectTitle}</p>
                                    </div>
                                  </div>
                                  <div className="bg-emerald-50 px-4 py-3">
                                    <p className="text-sm text-emerald-800 font-medium mb-3">The client has reviewed and accepted the final deliverables. You can now officially close this project.</p>
                                    {talkProject?.status !== 'Completed' && (
                                      <button
                                        onClick={handleMarkAsCompleted}
                                        className="w-full py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Move Project to Completed
                                      </button>
                                    )}
                                    {talkProject?.status === 'Completed' && (
                                      <div className="flex items-center justify-center gap-2 py-2 bg-emerald-100 rounded-lg">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span className="text-emerald-700 text-sm font-bold">Project Completed</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            // PAYMENT REQUEST card (admin view - shows as sent confirmation)
                            if (msg.text && msg.text.startsWith('PAYMENT_REQUEST_PAYLOAD|')) {
                              const parts = msg.text.split('|');
                              const amount = parts[1] || '';
                              const title = parts[2] || talkProject?.title;
                              return (
                                <div className="mt-2 rounded-xl border border-blue-200 overflow-hidden shadow-sm">
                                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-sm">Payment Request Sent</h4>
                                      <p className="text-blue-100 text-xs">{title}</p>
                                    </div>
                                  </div>
                                  <div className="bg-blue-50 px-4 py-3">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Escrow Amount</p>
                                    <p className="text-xl font-black text-blue-800 font-mono">{amount}</p>
                                    <p className="text-xs text-slate-500 mt-2">Client has been asked to pay the escrow amount to proceed.</p>
                                  </div>
                                </div>
                              );
                            }
                            // PROJECT REJECTED card (admin view)
                            if (msg.text && msg.text.startsWith('PROJECT_REJECTED_PAYLOAD|')) {
                              const title = msg.text.split('|')[1] || '';
                              return (
                                <div className="mt-2 rounded-xl border border-red-200 overflow-hidden shadow-sm">
                                  <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                      <X className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-sm">Project Rejected</h4>
                                      <p className="text-red-100 text-xs">{title}</p>
                                    </div>
                                  </div>
                                  <div className="bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-700 font-medium">This project was rejected and the client has been notified.</p>
                                  </div>
                                </div>
                              );
                            }
                            if (msg.text && msg.text.startsWith('DELIVERABLE_LINK_PAYLOAD|')) {
                              const deliverableUrl = msg.text.split('|')[1];
                              return (
                                <div className={`p-4 mt-2 rounded-xl border ${isMe ? 'bg-blue-500 border-blue-400' : 'bg-slate-50 border-slate-200'} shadow-sm flex flex-col gap-3`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h4 className={`font-bold text-sm ${isMe ? 'text-white' : 'text-slate-900'}`}>Project Deliverables Ready</h4>
                                      <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>Secure Google Drive Access</p>
                                    </div>
                                  </div>
                                  <a href={deliverableUrl} target="_blank" rel="noopener noreferrer" className={`w-full py-2 flex items-center justify-center gap-2 font-bold text-sm rounded-lg transition shadow-sm ${isMe ? 'bg-white text-blue-600 hover:bg-slate-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    Access Project Files
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              );
                            }
                            return <div>{msg.text}</div>;
                          })()}
                          <div className={`text-xs mt-2 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pending Client Approval Notification */}
                  {messages.some((m: any) => m.text?.startsWith('CLIENT_APPROVAL_REQUEST|')) &&
                   talkProject?.status !== 'Completed' && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-amber-700">Client awaiting your approval to close the project</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message the client..." 
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    <button type="submit" className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-md shrink-0 cursor-pointer">
                      <Play className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </form>
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
                        {talkProject.freelancerAssigned.map((name, i) => {
                          const fid = talkProject.freelancerAssignedIds?.[i];
                          const isSelected = selectedChatFreelancerId === fid;
                          return (
                            <div 
                              key={i} 
                              onClick={() => setSelectedChatFreelancerId(isSelected ? '' : fid)}
                              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                                isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {name?.charAt(0) || 'U'}
                              </div>
                              <span className={`font-bold text-sm ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{name || 'Unknown'}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Work Progress / Deliverables — only for Ongoing/Published */}
                  {talkProject.status !== 'Published' && talkProject.status !== 'Completed' && (
                    <div className="space-y-6">
                      {/* Section 1: Progress */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Work Progress</h3>
                        <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Completion Percentage</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="range" 
                                min="0" max="100" 
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="font-bold text-slate-900 w-10 text-right">{progress}%</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleUpdateProgress}
                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                          >
                            Send Progress to Chat
                          </button>
                        </div>
                      </div>

                      {/* Section 2: Deliverables */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Deliverables</h3>
                        <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Google Drive Link</label>
                            <input 
                              type="text" 
                              value={driveLink}
                              onChange={(e) => setDriveLink(e.target.value)}
                              placeholder="https://drive.google.com/..." 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={handleSendLink}
                              disabled={!driveLink}
                              className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:bg-slate-300"
                            >
                              Send Link to Chat
                            </button>

                            {progress === 100 && (
                              <button 
                                onClick={handleMarkAsCompleted}
                                className="w-full py-2 mt-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Final Completed
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Project Sidebar — Rating/Review & Reopen Option */}
                  {talkProject.status === 'Completed' && (
                    <div className="space-y-5">
                      {/* Project Status Badge */}
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-black text-emerald-800">Project Completed</p>
                          <p className="text-xs text-emerald-600 font-medium">Officially closed & settled</p>
                        </div>
                      </div>

                      {/* Client Rating & Review */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Client Feedback</h3>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                          {talkProject.rating ? (
                            <>
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Star Rating</p>
                                <div className="flex items-center gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <span key={s} className={`text-2xl ${s <= talkProject.rating! ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                  ))}
                                  <span className="ml-2 font-black text-slate-800 text-lg">{talkProject.rating}/5</span>
                                </div>
                              </div>
                              {talkProject.review && (
                                <div>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Review</p>
                                  <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-amber-100 leading-relaxed italic">"{talkProject.review}"</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-slate-500 italic text-center py-2">No rating submitted yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Send Back to Ongoing */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Project Update</h3>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <p className="text-xs text-slate-500 font-medium">If revisions are needed, send this project back to Ongoing so the freelancer can make updates.</p>
                          <button
                            onClick={handleRevertToOngoing}
                            className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Send Back to Ongoing
                          </button>
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
                          {freelancer.initials ? freelancer.initials.charAt(0) : freelancer.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">{freelancer.name}</h3>
                          <p className="text-base font-medium text-slate-500 mb-3">{freelancer.title || 'Freelancer'}</p>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.skills?.map((skill: string) => (
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
