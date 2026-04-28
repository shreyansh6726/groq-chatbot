import React, { useState, useRef, useEffect } from 'react';
import Groq from "groq-sdk";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';
import './App.css';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// Custom Code Block with Copy Button
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const content = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <button className="copy-button" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <code className={className} {...props}>{children}</code>;
};

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your professional AI assistant. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const chatWindowRef = useRef(null);
  const recognitionRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    // Initialize Voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
      setSelectedVoice(defaultVoice?.name);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional, formal, and highly capable AI assistant. Respond using clear markdown formatting. Use bolding for emphasis, headings for structure, and code blocks for any technical snippets. Maintain a polite and helpful tone." },
          ...messages,
          userMessage
        ],
        model: "llama-3.3-70b-versatile",
      });

      const botContent = chatCompletion.choices[0]?.message?.content || "I apologize, but I encountered an error processing your request.";
      const botMessage = { role: 'assistant', content: botContent };

      setMessages(prev => [...prev, botMessage]);
      if (autoSpeak) speak(botContent.replace(/[#*`]/g, ''));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you?' }]);
  };

  return (
    <div className="app-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={24} color="#3b82f6" />
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Groq Elite</h1>
          </div>
        </div>

        <div className="sidebar-section">
          <h2>Voice Settings</h2>
          <select
            className="voice-select"
            value={selectedVoice || ''}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="autoSpeak"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
            />
            <label htmlFor="autoSpeak" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Auto-read responses</label>
          </div>
        </div>

        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <button className="icon-button" onClick={clearChat} style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}>
            <Trash2 size={18} style={{ marginRight: '8px' }} />
            Clear Conversation
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Groq Chatbot</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isSpeaking ? (
              <button className="icon-button" onClick={stopSpeaking} title="Stop Speaking">
                <VolumeX size={20} />
              </button>
            ) : null}
          </div>
        </header>

        <div className="chat-container" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
              <div className="message-bubble">
                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{ code: CodeBlock }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'assistant' && (
                  <div className="voice-control">
                    <button className="speak-btn" onClick={() => speak(msg.content.replace(/[#*`]/g, ''))}>
                      <Volume2 size={14} />
                      Listen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row bot">
              <div className="message-bubble">
                <div className="loading">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="input-section">
          <form className="input-container" onSubmit={handleSend}>
            <button
              type="button"
              className={`icon-button ${isListening ? 'active' : ''}`}
              onClick={toggleListening}
              title="Voice Input"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your request..."
              disabled={isLoading}
            />
            <button type="submit" className="icon-button send-button" disabled={isLoading || !input.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
