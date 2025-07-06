"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { MessageSquare, UserCircle, Search, MoreVertical, Dot } from "lucide-react";

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_API_WRITE_TOKEN, // Ensure this token has read/write permissions
});

interface ChatMessage {
  _key: string;
  from: "user" | "bot" | "agent" | "admin";
  text: string;
  _createdAt?: string;
}

interface ChatSession {
  sessionId: string;
  phoneNumber: string;
  lastMessageText: string;
  lastMessageTime: string;
}

const AdminChatInterface = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all unique sessions and their last messages and subscribe to real-time updates
  useEffect(() => {
    const fetchAndSubscribeSessions = async () => {
      const query = `*[_type == "chatMessage"] | order(_createdAt desc) {
        sessionId,
        phoneNumber,
        text,
        _createdAt
      }`;
      const initialResult = await client.fetch(query);

      const sessionMap = new Map<string, ChatSession>();
      initialResult.forEach((msg: any) => {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, {
            sessionId: msg.sessionId,
            phoneNumber: msg.phoneNumber,
            lastMessageText: msg.text,
            lastMessageTime: msg._createdAt,
          });
        }
      });
      setSessions(Array.from(sessionMap.values()).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()));

      // Listen for new messages or updates to existing messages
      const subscription = client.listen(`*[_type == "chatMessage"]`).subscribe((update) => {
        if (update.result) {
          setSessions((prevSessions) => {
            const updatedSession = {
              sessionId: update.result.sessionId,
              phoneNumber: update.result.phoneNumber,
              lastMessageText: update.result.text,
              lastMessageTime: update.result._createdAt,
            };

            const existingSessionIndex = prevSessions.findIndex(
              (s) => s.sessionId === updatedSession.sessionId
            );

            let newSessions;
            if (existingSessionIndex > -1) {
              // Update existing session
              newSessions = [...prevSessions];
              newSessions[existingSessionIndex] = updatedSession;
            } else {
              // Add new session
              newSessions = [updatedSession, ...prevSessions];
            }

            // Sort by last message time (newest first)
            return newSessions.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
          });
        }
      });

      return () => subscription.unsubscribe();
    };

    fetchAndSubscribeSessions();
  }, []);

  // Subscribe to messages for the selected session
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    // Fetch initial messages for the selected session
    const fetchMessages = async () => {
      const query = `*[_type == "chatMessage" && sessionId == $sessionId] | order(_createdAt asc)`;
      const params = { sessionId: selectedSessionId };
      const initialMessages = await client.fetch(query, params);
      setMessages(
        initialMessages.map((msg: any) => ({
          _key: msg._id,
          from: msg.author,
          text: msg.text,
          _createdAt: msg._createdAt,
        }))
      );
    };

    fetchMessages();

    // Listen for new messages in real-time
    const query = `*[_type == "chatMessage" && sessionId == $sessionId]`;
    const params = { sessionId: selectedSessionId };

    const subscription = client.listen(query, params).subscribe((update) => {
      if (update.result) {
        setMessages((prevMessages) => {
          // Prevent duplicate messages if the initial fetch and listen overlap
          if (prevMessages.some((msg) => msg._key === update.result._id)) {
            return prevMessages;
          }
          return [
            ...prevMessages,
            {
              from: update.result.author,
              text: update.result.text,
              _key: update.result._id,
              _createdAt: update.result._createdAt,
            },
          ];
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && selectedSessionId) {
      const currentSession = sessions.find(s => s.sessionId === selectedSessionId);
      if (!currentSession) {
        console.error("No session found for selectedSessionId:", selectedSessionId);
        return;
      }

      const message = {
        sessionId: selectedSessionId,
        phoneNumber: currentSession.phoneNumber, // Add phoneNumber here
        author: "admin", // This identifies the message as from the admin
        text: inputValue.trim(),
      };

      try {
        // Reusing the existing /api/chat endpoint to send messages
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          throw new Error("Failed to send message from admin");
        }

        setInputValue("");
      } catch (error) {
        console.error("Error sending admin message:", error);
        // Optionally, show an error message to the admin
      }
    }
  };

  return (
    <>
      {/* CSS cho background pattern của khu vực chat */}
      <style jsx>{`
        .chat-bg {
          background-color: #f8fafc; /* bg-slate-50 */
          opacity: 1;
          background-image: linear-gradient(#e2e8f0 1px, transparent 1px),
            linear-gradient(to right, #e2e8f0 1px, #f8fafc 1px);
          background-size: 20px 20px;
        }
      `}</style>
      
      <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
        {/* ======================= */}
        {/* Danh sách Session    */}
        {/* ======================= */}
        <div className="flex flex-col w-full max-w-xs bg-white border-r border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-sky-500" />
              Cuộc hội thoại
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Chưa có phiên chat nào.</p>
            ) : (
              <ul>
                {sessions.map((session) => (
                  <li
                    key={session.sessionId}
                    className={`p-3 border-l-4 transition-colors cursor-pointer ${
                      selectedSessionId === session.sessionId
                        ? "bg-sky-50 border-sky-500"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-900">
                        {session.phoneNumber}
                      </p>
                      <p className="text-xs text-slate-400">
                         {new Date(session.lastMessageTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-slate-500 truncate w-5/6">
                        {session.lastMessageText}
                      </p>
                      {/* Gợi ý vị trí cho chỉ báo tin nhắn chưa đọc */}
                      <Dot className="w-8 h-8 text-sky-500" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ======================= */}
        {/* Cửa sổ Chat       */}
        {/* ======================= */}
        <div className="flex-1 flex flex-col">
          {!selectedSessionId ? (
             <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="mt-2 text-lg font-medium">Chọn một hội thoại</h3>
                    <p className="text-sm">Bắt đầu xem và trả lời tin nhắn của khách hàng.</p>
                </div>
            </div>
          ) : (
            <>
              {/* Header của cửa sổ chat */}
              <div className="bg-white text-slate-900 p-3 flex items-center justify-between border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-10 h-10 text-slate-400" />
                  <div>
                    <h3 className="font-bold">
                      {sessions.find((s) => s.sessionId === selectedSessionId)?.phoneNumber}
                    </h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                        <Search className="w-5 h-5"/>
                    </Button>
                     <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                        <MoreVertical className="w-5 h-5"/>
                    </Button>
                </div>
              </div>

              {/* Khu vực hiển thị tin nhắn */}
              <div className="flex-1 p-6 overflow-y-auto chat-bg">
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div
                        key={msg._key}
                        className={`flex items-end gap-2 max-w-[75%] ${
                            msg.from === "user" ? "self-start" : "self-end"
                        }`}
                    >
                        {msg.from === "user" && <UserCircle className="w-8 h-8 text-slate-400 flex-shrink-0"/>}
                        <div
                            className={`p-3 rounded-2xl shadow-sm ${
                                msg.from === "user"
                                ? "bg-white text-slate-800 rounded-bl-none"
                                : "bg-sky-500 text-white rounded-br-none"
                            }`}
                        >
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-2 ${
                                msg.from === "user" ? "text-slate-400" : "text-sky-100"
                            } text-right`}>
                                {new Date(msg._createdAt || "").toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
              
              {/* Khung nhập liệu */}
              <div className="p-4 border-t border-slate-200 bg-white">
                 <div className="relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Nhập tin nhắn..."
                        className="rounded-full pl-4 pr-12 py-6 border-slate-300 focus-visible:ring-sky-500"
                    />
                    <Button onClick={handleSendMessage} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sky-500 hover:bg-sky-600">
                        <Send className="w-5 h-5" />
                    </Button>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminChatInterface;