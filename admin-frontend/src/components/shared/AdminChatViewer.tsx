import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, CheckCircle, ThumbsUp } from "lucide-react";
import api from "@/lib/api";

interface AdminChatViewerProps {
  project: any;
  freelancerId?: string;
  onClose: () => void;
}

export default function AdminChatViewer({ project, freelancerId, onClose }: AdminChatViewerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const url = freelancerId
        ? `/messages/${project.id}?freelancerId=${freelancerId}`
        : `/messages/${project.id}`;
      const res = await api.get(url);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch {
      // silently fail on poll
    }
  };

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [project.id, freelancerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !freelancerId) return;
    setSending(true);
    try {
      await api.post(`/messages/${project.id}`, {
        content: newMessage,
        senderId: freelancerId,
        freelancerId,
      });
      setNewMessage("");
      fetchMessages();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const renderMessageContent = (msg: any, isFreelancer: boolean) => {
    const text: string = msg.text || msg.content || "";

    if (text.startsWith("CLIENT_APPROVAL_REQUEST|")) {
      const projectTitle = text.split("|")[1] || project.title;
      return (
        <div className="mt-2 rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Client Approved Deliverables</h4>
              <p className="text-emerald-100 text-xs">{projectTitle}</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-800 font-medium">The client accepted the final deliverables.</p>
          </div>
        </div>
      );
    }

    if (text.startsWith("PAYMENT_REQUEST_PAYLOAD|")) {
      const parts = text.split("|");
      const amount = parts[1] || "";
      const title = parts[2] || project.title;
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
          </div>
        </div>
      );
    }

    if (text.startsWith("CLIENT_RATING_REVIEW|")) {
      const parts = text.split("|");
      const rating = parseInt(parts[1]) || 0;
      const review = parts[2] || "";
      return (
        <div className="mt-2 rounded-xl border border-amber-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Client Rating and Review</h4>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-white fill-white" : "text-amber-300 fill-amber-300 opacity-40"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-amber-50 px-4 py-3">
            <p className="text-sm text-slate-700 italic">"{review}"</p>
          </div>
        </div>
      );
    }

    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{project.title || project.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Project Chat</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {project.status}
                </span>
                {(project.status === "COMPLETED" || project.status === "Completed") && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400 max-w-xs">Chat history will appear here once the project conversation begins.</p>
            </div>
          )}

          {messages.map((msg: any, i: number) => {
            const isFreelancer = msg.senderId === freelancerId;
            return (
              <div key={msg.id || i} className={`flex items-start gap-3 ${isFreelancer ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${isFreelancer ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                  {(msg.sender || "U").charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-md rounded-2xl shadow-sm px-4 py-3 ${isFreelancer ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}`}>
                  <p className={`text-[11px] font-bold mb-1 ${isFreelancer ? "text-blue-200" : "text-slate-400"}`}>
                    {msg.sender || "Unknown"}
                  </p>
                  {renderMessageContent(msg, isFreelancer)}
                  {msg.time && (
                    <p className={`text-[10px] mt-1.5 ${isFreelancer ? "text-blue-300" : "text-slate-400"}`}>{msg.time}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        {project.status === "COMPLETED" || project.status === "Completed" ? (
          <div className="px-6 py-4 border-t border-slate-200 bg-emerald-50 flex items-center gap-3 shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Project Completed</p>
              <p className="text-xs text-emerald-600">Read-only view of completed project chat. Client rating is visible above.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="px-4 py-4 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message as Admin..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
