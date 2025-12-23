import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Maximize2, X } from 'lucide-react';
import './ChatbotUI.css'; // Importing the CSS file

const ChatbotUI = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "I'm processing that for you...", sender: 'bot' },
      ]);
    }, 1000);
  };

  return (
    <div className="chat-container-wrapper">
      <div className="chat-card">
        
        {/* Header */}
        <div className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">
              <Bot size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1f2937' }}>AI Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="status-dot"></span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Online</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', color: '#9ca3af' }}>
            <Maximize2 size={18} style={{ cursor: 'pointer' }} />
            <X size={18} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="chat-input-form">
          <div className="input-wrapper">
            {/* Pin icon removed from here */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ paddingLeft: '16px' }} 
            />
            <button type="submit" className="send-button">
              <Send size={18} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>
            Powered by Gemini AI
          </div>
        </form>

      </div>
    </div>
  );
};

export default ChatbotUI;