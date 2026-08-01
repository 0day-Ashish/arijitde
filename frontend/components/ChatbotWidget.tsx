'use client';

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  options?: string[];
}

interface ChatbotWidgetProps {
  isFooterIntersecting?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatMessageText(text: string) {
  if (!text) return "";
  
  // Split by bold (**text** or __text__)
  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-primary">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return <strong key={index} className="font-extrabold text-primary">{part.slice(2, -2)}</strong>;
    }
    
    // Split the remaining parts by italics (*text* or _text_)
    const subParts = part.split(/(\*.*?\*|_.*?_)/g);
    return subParts.map((subPart, subIndex) => {
      if (subPart.startsWith("*") && subPart.endsWith("*")) {
        return <em key={`${index}-${subIndex}`} className="italic">{subPart.slice(1, -1)}</em>;
      }
      if (subPart.startsWith("_") && subPart.endsWith("_")) {
        return <em key={`${index}-${subIndex}`} className="italic">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

export default function ChatbotWidget({
  isFooterIntersecting = false,
  isOpen,
  onOpenChange
}: ChatbotWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isChatOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setIsChatOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: "bot", 
      text: "Hello! I'm Virtual Arijit, your personal AI assistant. Before we begin, are you a New User or an Existing Client? Select an option below to get started, or ask a question:",
      options: ["New User", "Existing Client"]
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
 
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen, isTyping]);
 
  if (!mounted) return null;

  const sendUserMessage = async (userMessageText: string, currentMessagesState = messages) => {
    if (isTyping) return;
    const userMsg: Message = { id: Date.now(), sender: "user", text: userMessageText };
    const updatedMessages = [...currentMessagesState, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Format messages history for the API (exclude layout-only options attribute)
      const history = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: data.error || "Failed to get response. Please try again." }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: "Network error. Please check your connection and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (opt: string, messageId: number) => {
    // 1. Clear the option pills from the message in state
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, options: undefined } : m));
    
    // 2. Submit the message using the updated state to avoid closure lag
    const clearedMessages = messages.map(m => m.id === messageId ? { ...m, options: undefined } : m);
    sendUserMessage(opt, clearedMessages);
  };
 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;
 
    const userMessageText = inputVal.trim();
    setInputVal("");
    await sendUserMessage(userMessageText);
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-500 ease-out",
        isFooterIntersecting
          ? "opacity-0 translate-y-10 scale-90 pointer-events-none"
          : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
      )}
    >
      {/* Chatbot Modal */}
      {isChatOpen && (
        <div className="w-80 md:w-96 h-[450px] md:h-[500px] mb-4 rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 origin-bottom-right">
          {/* Header */}
          <div className="px-5 py-4 bg-transparent border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-primary tracking-wide font-clash">Virtual Arijit</span>
                <span className="text-[10px] text-neutral-400 font-mono">AI AGENT • ONLINE</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-neutral-400 hover:text-primary transition duration-150 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div
            data-lenis-prevent
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-border select-text"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] flex flex-col gap-1.5",
                  msg.sender === "user" ? "self-end" : "self-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed border text-left font-clash w-full whitespace-pre-line",
                    msg.sender === "user"
                      ? "bg-primary/10 border-primary/15 text-primary rounded-br-none"
                      : "bg-neutral-100 border-neutral-200 text-neutral-800 rounded-bl-none"
                  )}
                >
                  {formatMessageText(msg.text)}
                </div>
                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-0.5 justify-start">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleOptionClick(opt, msg.id)}
                        className="px-3.5 py-1.5 bg-[#3A8293]/10 border border-[#3A8293]/20 hover:bg-[#3A8293] hover:text-white text-[#3A8293] rounded-full text-xs font-semibold font-clash transition duration-150 cursor-pointer select-none"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="bg-neutral-100 border border-neutral-200 text-neutral-500 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm self-start flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[100ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[200ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[300ms]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-transparent flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about portfolio optimization, mutual funds, or LIC policies..."
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/40 border border-neutral-200 text-neutral-800 focus:outline-none focus:border-primary placeholder-neutral-400 font-clash"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition duration-200 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Speech Bubble */}
      {!isChatOpen && (
        <div className="absolute bottom-16 right-2 mb-2.5 bg-white/80 border border-primary/10 rounded-xl px-3 py-1.5 text-xs text-black tracking-wide shadow-lg whitespace-nowrap select-none font-clash">
          Have portfolio questions? <span className="font-semibold text-primary">Ask Virtual Arijit here</span>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-14 h-14 rounded-full bg-[#3A8293] hover:bg-[#3A8293]/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {isChatOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <MessageSquare className="w-6 h-6 fill-current" />
        )}
      </button>
    </div>
  );
}
