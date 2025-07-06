"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const client = createClient({
  apiVersion,
  dataset,
  projectId,
});

const CustomChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isChatting || !sessionId) return;

    const query = `*[_type == "chatMessage" && sessionId == $sessionId] | order(_createdAt asc)`;
    const params = { sessionId };

    const subscription = client.listen(query, params).subscribe((update) => {
      if (update.result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            from: update.result.author,
            text: update.result.text,
            _key: update.result._id,
          },
        ]);
      }
    });

    return () => subscription.unsubscribe();
  }, [isChatting, sessionId]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Only reset if opening and not already chatting (i.e., first time opening or starting new chat)
    if (!isOpen && !isChatting) {
      setMessages([]);
      setInputValue("");
      setPhoneNumber("");
      setPhoneError("");
      setIsChatting(false);
      setSessionId("");
    }
  };

  const handlePhoneNumberSubmit = () => {
    const phoneRegex = /^\d{10}$/;
    if (phoneRegex.test(phoneNumber)) {
      setPhoneError("");
      setIsChatting(true);
      const newSessionId = `${phoneNumber}-${Date.now()}`;
      setSessionId(newSessionId);
      setMessages([
        {
          from: "bot",
          text: `Cảm ơn Anh/Chị đã quan tâm đến dịch vụ của Nhà thuốc Khủng Long Châu. Em sẵn sàng hỗ trợ và tư vấn cho mình ngay ạ!`,
          _key: "initial",
        },
      ]);
    } else {
      setPhoneError("Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số.");
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const message = {
        sessionId,
        phoneNumber,
        author: "user",
        text: inputValue.trim(),
      };

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        setInputValue("");
      } catch (error) {
        console.error(error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <Button
          onClick={toggleChat}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="w-8 h-8 text-white" />
        </Button>
      ) : (
        <div className="w-80 h-[450px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Tư vấn trực tuyến</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="hover:bg-blue-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            {!isChatting ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-2 text-center">
                  Vui lòng nhập số điện thoại của bạn để bắt đầu cuộc trò
                  chuyện.
                </p>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại (10 chữ số)"
                  className="mb-2"
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mb-2">{phoneError}</p>
                )}
                <Button onClick={handlePhoneNumberSubmit}>
                  Bắt đầu trò chuyện
                </Button>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._key}
                  className={`mb-3 p-2 rounded-lg max-w-[80%] ${
                    msg.from === "bot" ||
                    msg.from === "agent" ||
                    msg.from === "admin"
                      ? "bg-gray-200 text-black self-start"
                      : "bg-blue-500 text-white self-end ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {isChatting && (
            <div className="p-2 border-t flex">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="ml-2">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomChat;
