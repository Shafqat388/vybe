import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaRobot } from "react-icons/fa";
import axios from "axios";

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setChat(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/ai/ask", {
        message: input,
      });

      const aiMessage = {
        role: "assistant",
        content: res.data.reply,
      };
      setChat(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: "assistant", content: "Error occurred!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[300px] h-[400px] bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
            <span>AI Chatbot</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 text-sm">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${msg.role === "user" ? "text-right text-blue-600" : "text-left text-green-600"}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="text-center text-gray-500">Typing...</div>}
          </div>

          {/* Input */}
          <div className="flex p-2 border-t">
            <input
              type="text"
              className="flex-1 border px-2 py-1 rounded mr-2 text-black"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className="text-black p-1 bg-gray-200 rounded">
              <IoMdSend />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-[50px] h-[50px] rounded-full bg-black text-white flex items-center justify-center shadow-lg"
        >
          <FaRobot size={24} />
        </button>
      )}
    </div>
  );
}

export default ChatbotWidget;
