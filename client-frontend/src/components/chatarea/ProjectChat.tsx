import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import chatData from "../../utils/chatData.json";

export default function ProjectChat() {
  const { id, freelancerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Resolve Project & Freelancer from state or chatData fallback
  const project = location.state?.project || {
    id: id || chatData.project.id,
    name: chatData.project.name
  };

  const freelancer = location.state?.freelancer || {
    id: freelancerId || chatData.freelancer.id,
    name: chatData.freelancer.name,
    avatar: chatData.freelancer.avatar
  };

  // 2. Chat messages state
  const [messages, setMessages] = useState<any[]>(chatData.initialMessages);
  const [inputMessage, setInputMessage] = useState("");

  // 3. Contribution banner state
  const [requestStatus, setRequestStatus] = useState("idle");

  const storageKey = `htge_chat_request_${project.id}_${freelancer.id}`;

  // Check localStorage for saved request status
  useEffect(() => {
    const savedStatus = localStorage.getItem(storageKey);
    if (savedStatus === "waiting") {
      setRequestStatus("waiting");
      setMessages((prev) => {
        const alreadySent = prev.some(
          (m) => m.text === chatData.contributionConfig.requestMessage
        );
        if (!alreadySent) {
          return [
            ...prev,
            {
              id: Date.now(),
              sender: chatData.currentUser.name,
              isMe: true,
              time: "11:15 AM",
              text: chatData.contributionConfig.requestMessage,
              avatar: chatData.currentUser.avatar
            }
          ];
        }
        return prev;
      });
    }
  }, [storageKey]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, requestStatus]);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handler: When clicking "Send Request" in banner
  const handleSendContributionRequest = () => {
    if (requestStatus === "waiting") return;

    setRequestStatus("waiting");
    localStorage.setItem(storageKey, "waiting");

    const requestMsg = {
      id: Date.now(),
      sender: chatData.currentUser.name,
      isMe: true,
      time: getCurrentTime(),
      text: chatData.contributionConfig.requestMessage,
      avatar: chatData.currentUser.avatar
    };

    setMessages((prev) => [...prev, requestMsg]);
  };

  // Handler: Send manual typed text message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: chatData.currentUser.name,
      isMe: true,
      time: getCurrentTime(),
      text: inputMessage.trim(),
      avatar: chatData.currentUser.avatar
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
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
      sender: chatData.currentUser.name,
      isMe: true,
      time: getCurrentTime(),
      isDoc: true,
      fileName: file.name,
      fileSize: formattedSize,
      avatar: chatData.currentUser.avatar
    };

    setMessages((prev) => [...prev, docMsg]);
    e.target.value = ""; // reset input
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project Details
        </button>
        <span className="text-xs font-mono text-slate-400">ID: #{project.id}</span>
      </div>

      {/* 1. TOP HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={freelancer.avatar || chatData.freelancer.avatar}
              alt={freelancer.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Freelancer: <span className="text-slate-700 font-medium">{freelancer.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. CHAT CONVERSATION STREAM */}
      <div className="space-y-6 pt-2 pb-4">
        {messages.map((msg) => {
          if (msg.isMe) {
            // Right-aligned message (You)
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="font-semibold text-slate-700">You</span>
                  <span className="text-slate-400 text-[11px]">{msg.time}</span>
                  <img
                    src={msg.avatar || chatData.currentUser.avatar}
                    alt="You"
                    className="w-6 h-6 rounded-full object-cover border border-slate-200 ml-1"
                  />
                </div>

                {/* If it's a document message */}
                {msg.isDoc ? (
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3.5 text-xs shadow-xs max-w-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">{msg.fileName}</p>
                      <p className="text-[10px] text-blue-100">{msg.fileSize}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-5 py-3.5 text-xs sm:text-sm font-normal max-w-lg md:max-w-xl shadow-xs leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            );
          } else {
            // Left-aligned message (Freelancer)
            return (
              <div key={msg.id} className="flex flex-col items-start space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <img
                    src={msg.avatar || freelancer.avatar}
                    alt={msg.sender}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200 mr-1"
                  />
                  <span className="font-semibold text-slate-900">{msg.sender}</span>
                  <span className="text-slate-400 text-[11px]">{msg.time}</span>
                </div>

                <div className="bg-white border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-xs px-5 py-3.5 text-xs sm:text-sm font-normal max-w-lg md:max-w-xl shadow-xs leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. CONTRIBUTION STATUS BANNER */}
      <div className="bg-[#EEF4FF] border border-blue-100 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-xs transition-all">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
            !
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {requestStatus === "waiting"
                ? chatData.contributionConfig.waitingTitle
                : chatData.contributionConfig.requestTitle}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {chatData.contributionConfig.subtitle}
            </p>
          </div>
        </div>

        {requestStatus === "idle" && (
          <button
            type="button"
            onClick={handleSendContributionRequest}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
          >
            {chatData.contributionConfig.buttonText}
          </button>
        )}
      </div>

      {/* 4. MESSAGE INPUT BAR WITH DOC ATTACHMENT ICON */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 flex items-center gap-2"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
        />

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none rounded-xl border border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
        />

        {/* Document Icon (Left of Send Button) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 text-slate-500 hover:text-blue-600 flex items-center justify-center transition shadow-xs shrink-0 cursor-pointer"
          title="Send document or attachment"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center transition shadow-sm shadow-blue-500/20 shrink-0 cursor-pointer"
          title="Send message"
        >
          <svg className="w-4 h-4 transform rotate-45 -translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}