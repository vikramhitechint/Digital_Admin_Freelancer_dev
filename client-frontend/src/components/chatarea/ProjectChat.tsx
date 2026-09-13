import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ProjectChat() {
  const { id, freelancerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [clientApprovalSent, setClientApprovalSent] = useState(false);

  // 1. Resolve Project & Freelancer from state
  const [project, setProject] = useState<any>(location.state?.project || { id, name: "Loading..." });
  const freelancer = location.state?.freelancer || {
    id: freelancerId || "freelancer-id",
    name: "Freelancer",
    avatar: "https://ui-avatars.com/api/?name=Freelancer&background=random"
  };

  // 2. Chat messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");


  // 3. Contribution banner state
  const [requestStatus, setRequestStatus] = useState("idle");

  const storageKey = `htge_chat_request_${project.id}_${freelancer.id}`;

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data) {
        // Map the structure because projectController returns the project directly
        setProject(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch project");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${id}?freelancerId=${freelancerId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const intervalId = setInterval(() => {
      fetchMessages();
      fetchProjectDetails();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [id]);

  // Check localStorage for saved request status
  useEffect(() => {
    const savedStatus = localStorage.getItem(storageKey);
    if (savedStatus === "waiting") {
      setRequestStatus("waiting");
    }
  }, [storageKey]);

  // Auto scroll to latest message
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 300);
    return () => clearTimeout(timeout);
  }, [messages, requestStatus, project?.status, project?.completionPercentage]);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handler: When clicking "Send Request" in banner
  const handleSendContributionRequest = async () => {
    if (requestStatus === "waiting") return;

    setRequestStatus("waiting");
    localStorage.setItem(storageKey, "waiting");

    const clientUserStr = localStorage.getItem('htge_auth_user');
    const clientUser = clientUserStr ? JSON.parse(clientUserStr) : null;
    const clientId = clientUser?.user?.id || 'client-id';
    
    try {
      const res = await api.post(`/messages/${project.id}`, {
        content: "Please start the contribution and send updates.",
        senderId: clientId,
        freelancerId
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handlePayment = async (paymentType: 'ESCROW' | 'PENALTY_10') => {
    try {
      const res = await api.post(`/payments/create-order`, {
        projectId: project.id,
        paymentType
      });
      
      if (!res.data.success) {
        alert('Failed to create order');
        return;
      }

      const { orderId, amount, currency } = res.data.data;
      const order = res.data.data;

      const options = {
        // @ts-ignore
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TbSMdgz7Vj4Xqe", // Fallback to test key
        amount: order.amount || amount,
        currency: order.currency || currency,
        name: "HTGE Portal",
        description: `Payment for ${project.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectId: id,
              paymentType: paymentType
            });

            if (verifyRes.data.success) {
               toast.success('Payment verified successfully!');
               // Update UI
               const updatedStatus = paymentType === 'ESCROW' ? 'ONGOING' : 'DROPPED';
               setProject((prev: any) => ({ ...prev, status: updatedStatus }));
               fetchMessages();
            }
          } catch (e) {
            toast.error('Payment verification failed');
          }
        },
        theme: {
          color: "#2563EB"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch(e) {
      console.error(e);
      alert('Error initiating payment');
    }
  };

  const handleDropOngoingProject = async () => {
    if (!window.confirm("Are you sure you want to drop this project? You will forfeit 25% of the escrowed amount as a penalty.")) return;

    try {
      const res = await api.put(`/projects/${project.id}/drop`);
      if (res.data.success) {
        alert(res.data.message);
        setProject((prev: any) => ({ ...prev, status: 'DROPPED' }));
        fetchMessages();
      }
    } catch(e) {
      console.error(e);
      alert('Failed to drop project');
    }
  };

  const handleAcceptCompletion = async () => {
    const clientId = project?.clientId;
    if (!clientId) return;
    // Send approval message to chat so admin can see it and confirm
    try {
      await api.post(`/messages/${project.id}`, {
        content: `CLIENT_APPROVAL_REQUEST|${project.title}`,
        senderId: clientId,
        freelancerId
      });
      setClientApprovalSent(true);
      await fetchMessages();
    } catch (e) {
      console.error(e);
    }
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    try {
      // 1. Save rating to the database
      await api.put(`/projects/${project.id}/rate`, { rating, review });

      // 2. Post rating as a special visible chat message so Admin can see it
      const clientId = project?.clientId;
      const freelancerId = project?.freelancerAssignedIds?.[0] || location.state?.freelancer?.id;
      if (clientId && freelancerId) {
        await api.post(`/messages/${project.id}`, {
          content: `CLIENT_RATING_REVIEW|${rating}|${review}`,
          senderId: clientId,
          freelancerId,
        });
      }

      setShowRatingModal(false);
      setClientApprovalSent(true);
      fetchMessages();
    } catch (e) {
      console.error(e);
      alert('Failed to submit rating');
    }
  };

  // Handler: Send manual typed text message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const clientId = project?.clientId;
    if (!clientId) {
      alert("Error: Client ID not found for this project.");
      return;
    }

    try {
      const res = await api.post(`/messages/${project.id}`, {
        content: inputMessage.trim(),
        senderId: clientId,
        freelancerId
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setInputMessage("");
      }
    } catch(e) {
      console.error(e);
    }
  };

  // Handler: Send document when user selects a file from the doc icon
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const docMsg = {
      id: Date.now(),
      sender: "Client",
      isMe: true,
      time: getCurrentTime(),
      isDoc: true,
      fileName: file.name,
      fileSize: formattedSize,
      avatar: "https://ui-avatars.com/api/?name=Client&background=random"
    };

    setMessages((prev) => [...prev, docMsg]);
    e.target.value = ""; // reset input
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
              <span className="text-xl font-bold text-blue-600">{freelancer.name?.charAt(0)?.toUpperCase() || 'F'}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{project.title || project.name}</h2>
              <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <span>Freelancer: <strong className="text-slate-700">{freelancer.name}</strong></span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider">{project.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2 transition ml-2 hover:bg-slate-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area - Full Width */}
          <div className="flex-1 flex flex-col bg-[#F0F2F5] relative rounded-b-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover bg-center bg-fixed" style={{ backgroundBlendMode: 'overlay', backgroundColor: 'rgba(240, 242, 245, 0.95)'}}>
              <div className="flex justify-center mb-6 mt-2">
                <span className="text-[11px] font-bold bg-[#E1F3FB] text-slate-600 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-blue-100">Project Talk Space Initiated</span>
              </div>

              {/* Pending Admin Approval Banner — shown after client approves but before admin confirms */}
              {(clientApprovalSent || messages.some((m: any) => m.text?.startsWith('CLIENT_APPROVAL_REQUEST|'))) &&
               project?.status !== 'COMPLETED' && project?.status !== 'Completed' && (
                <div className="flex justify-center mb-2">
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Approval Sent to Admin ⏳</p>
                      <p className="text-xs text-amber-600 font-medium">Waiting for admin to officially close the project.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map((msg, i) => {
                const clientId = project?.clientId || '';
                const isMe = msg.senderId === clientId || msg.isMe;
                
                return (
                  <div key={i} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 mt-1 flex items-center justify-center font-bold shadow-sm ${isMe ? 'bg-[#DCF8C6] text-slate-800' : 'bg-slate-300 text-slate-600'}`}>
                      {msg.sender?.charAt(0) || (isMe ? 'C' : 'F')}
                    </div>
                    <div className={`p-5 rounded-2xl text-base shadow-sm max-w-xl ${isMe ? 'bg-[#DCF8C6] text-slate-800 rounded-tr-sm border border-[#C5E1A5]' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                      <p className={`font-bold mb-1 ${isMe ? 'text-slate-900' : 'text-blue-600'}`}>
                        {msg.sender}
                      </p>
                      {(() => {
                        const text = msg.text || "";

                        // ── PAYMENT REQUEST CARD ──
                        if (text.startsWith('PAYMENT_REQUEST_PAYLOAD|')) {
                          const parts = text.split('|');
                          const amount = parts[1] || '';
                          const title = parts[2] || project?.title || 'Your Project';
                          const alreadyPaid = project?.status === 'ONGOING' || project?.status === 'Ongoing';
                          return (
                            <div className="mt-2 rounded-2xl border border-blue-200 overflow-hidden shadow-md w-72">
                              {/* Card Header */}
                              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-black text-white text-sm">Payment Request</h4>
                                    <p className="text-blue-200 text-xs">Escrow Deposit Required</p>
                                  </div>
                                </div>
                                <p className="text-blue-100 text-xs font-medium truncate">{title}</p>
                              </div>
                              {/* Amount */}
                              <div className="bg-white px-5 py-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Escrow Amount</p>
                                <p className="text-2xl font-black text-slate-900 font-mono">{amount}</p>
                                <p className="text-xs text-slate-500 mt-1">Held securely until project completion</p>
                                <div className="mt-4">
                                  {alreadyPaid ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-sm font-bold text-emerald-700">Payment Confirmed ✓</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handlePayment('ESCROW')}
                                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      Pay Escrow Amount
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // ── PROJECT REJECTED CARD ──
                        if (text.startsWith('PROJECT_REJECTED_PAYLOAD|')) {
                          const title = text.split('|')[1] || project?.title || 'Your Project';
                          return (
                            <div className="mt-2 rounded-2xl border border-red-200 overflow-hidden shadow-md w-72">
                              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-black text-white text-sm">Project Not Approved</h4>
                                  <p className="text-red-200 text-xs">{title}</p>
                                </div>
                              </div>
                              <div className="bg-red-50 px-5 py-4">
                                <p className="text-sm text-red-700 font-medium leading-relaxed">Your project submission has been reviewed and was not approved at this time. Please contact support for more details.</p>
                              </div>
                            </div>
                          );
                        }

                        if (text.startsWith('CLIENT_APPROVAL_REQUEST|')) {
                          const projectTitle = text.split('|')[1] || project?.title || 'Your Project';
                          return (
                            <div className="mt-2 rounded-2xl border border-emerald-200 overflow-hidden shadow-md w-72">
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-black text-white text-sm">Client Approved Deliverables</h4>
                                  <p className="text-emerald-100 text-xs">{projectTitle}</p>
                                </div>
                              </div>
                              <div className="bg-emerald-50 px-5 py-4">
                                <p className="text-sm text-emerald-800 font-medium">The client accepted the final deliverables.</p>
                              </div>
                            </div>
                          );
                        }

                        if (text.startsWith('CLIENT_RATING_REVIEW|')) {
                          const parts = text.split('|');
                          const rating = parseInt(parts[1]) || 0;
                          const review = parts[2] || '';
                          return (
                            <div className="mt-2 rounded-2xl border border-amber-200 overflow-hidden shadow-md w-72">
                              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-black text-white text-sm">Client Rating and Review</h4>
                                  <div className="flex gap-1 mt-1">
                                    {[1,2,3,4,5].map(s => (
                                      <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-white fill-white' : 'text-amber-300 fill-amber-300 opacity-40'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-amber-50 px-5 py-4">
                                <p className="text-sm text-slate-700 italic">"{review}"</p>
                              </div>
                            </div>
                          );
                        }

                        if (text.startsWith('DELIVERABLE_LINK_PAYLOAD|')) {
                          const deliverableUrl = text.split('|')[1];
                          return (
                            <div className={`p-4 mt-2 rounded-xl border ${isMe ? 'bg-[#C5E1A5] border-[#AED581]' : 'bg-slate-50 border-slate-200'} shadow-sm flex flex-col gap-3`}>
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isMe ? 'bg-[#AED581] text-slate-800' : 'bg-blue-100 text-blue-600'}`}>
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className={`font-bold text-sm text-slate-900`}>Project Deliverables Ready</h4>
                                  <p className={`text-xs ${isMe ? 'text-slate-700' : 'text-slate-500'}`}>Secure Access Link</p>
                                </div>
                              </div>
                              <a href={deliverableUrl} target="_blank" rel="noopener noreferrer" className={`w-full py-2 flex items-center justify-center gap-2 font-bold text-sm rounded-lg transition shadow-sm ${isMe ? 'bg-white text-slate-800 hover:bg-slate-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                Access Project Files
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              {/* Accept Completion button — visible only to client (not isMe) and approval not yet sent */}
                              {!isMe && project?.status !== 'COMPLETED' && project?.status !== 'Completed' &&
                               !clientApprovalSent && !messages.some((m: any) => m.text?.startsWith('CLIENT_APPROVAL_REQUEST|')) && (
                                <div className="border-t border-slate-200 pt-3 mt-1">
                                  <p className="text-xs text-slate-500 font-medium mb-2 text-center">Satisfied with the deliverables?</p>
                                  <button
                                    onClick={handleAcceptCompletion}
                                    className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Accept & Complete Project
                                  </button>
                                </div>
                              )}
                              {/* Show 'Approval Sent' state on the card when client already approved */}
                              {!isMe && (clientApprovalSent || messages.some((m: any) => m.text?.startsWith('CLIENT_APPROVAL_REQUEST|'))) &&
                               project?.status !== 'COMPLETED' && project?.status !== 'Completed' && (
                                <div className="border-t border-slate-200 pt-3 mt-1">
                                  <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-lg">
                                    <span className="text-amber-600 text-sm font-bold">⏳ Waiting for Admin Approval</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        if (!urlRegex.test(text)) {
                          return <div className="leading-relaxed whitespace-pre-wrap">{text}</div>;
                        }
                        const parts = text.split(urlRegex);
                        return (
                          <div className="leading-relaxed whitespace-pre-wrap">
                            {parts.map((part: string, index: number) => 
                              urlRegex.test(part) ? (
                                <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold hover:underline break-all">
                                  {part}
                                </a>
                              ) : (
                                <span key={index}>{part}</span>
                              )
                            )}
                          </div>
                        );
                      })()}
                      <div className={`text-xs mt-2 ${isMe ? 'text-slate-500' : 'text-slate-400'}`}>{msg.time}</div>
                    </div>
                  </div>
                );
              })}


              <div ref={messagesEndRef} />
            </div>

            {project?.status === 'COMPLETED' || project?.status === 'Completed' ? (
              <div className="px-6 py-4 bg-emerald-600 border-t border-emerald-700 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-lg">✅</span>
                  <span className="text-white font-bold text-sm">This project is completed</span>
                </div>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition cursor-pointer shadow-sm"
                >
                  Rate & Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Message the freelancer..."
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-md shrink-0 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── RATING MODAL ── */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Rate your Experience</h3>
            <p className="text-slate-500 text-sm mb-6">How was it working with the freelancer on this project?</p>
            
            <div className="flex items-center gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <svg 
                    className={`w-12 h-12 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} transition-colors duration-200`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a brief review about the deliverables and the freelancer's communication..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px] resize-none mb-6"
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}