"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";

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
    <div className="flex h-screen bg-gray-100">
      {/* Session List */}
      <div className="w-1/4 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat Sessions</h2>
        {sessions.length === 0 && (
          <p className="text-gray-500">No active sessions.</p>
        )}
        <ul>
          {sessions.map((session) => (
            <li
              key={session.sessionId}
              className={`p-3 mb-2 rounded-lg cursor-pointer ${
                selectedSessionId === session.sessionId
                  ? "bg-blue-100"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedSessionId(session.sessionId)}
            >
              <p className="font-semibold">Phone: {session.phoneNumber}</p>
              <p className="text-sm text-gray-600 truncate">
                {session.lastMessageText}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(session.lastMessageTime).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-4 shadow-md">
          <h3 className="font-bold">
            {selectedSessionId
              ? `Chat with ${sessions.find((s) => s.sessionId === selectedSessionId)?.phoneNumber || selectedSessionId}`
              : "Select a session"}
          </h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col">
          {!selectedSessionId ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Please select a chat session to view messages.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._key}
                className={`mb-3 p-2 rounded-lg max-w-[70%] ${
                  msg.from === "user"
                    ? "bg-gray-200 text-black self-start mr-auto"
                    : "bg-blue-500 text-white self-end ml-auto"
                }`}
              >
                <p className="text-xs text-gray-700 mb-1">
                  {msg.from === "user" ? "User" : "Admin"}
                </p>
                {msg.text}
                <p className="text-xs text-gray-400 text-right mt-1">
                  {new Date(msg._createdAt || "").toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedSessionId && (
          <div className="p-4 border-t bg-white flex">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="ml-2">
              <Send className="w-5 h-5" /> Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatInterface;