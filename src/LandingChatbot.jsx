import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Cpu, Mic, MicOff, Trash2 } from 'lucide-react';
import './App.css';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const cleanResponse = (value) => String(value || '')
  .replace(/<think>[\s\S]*?<\/think>/gi, '')
  .trim();

function LandingChatbot({ initialRect }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const inputRef = useRef(null);
  const [isReady, setIsReady] = useState(!initialRect);
  const [inputMotionStyle, setInputMotionStyle] = useState({});

  useLayoutEffect(() => {
    if (!initialRect || !inputRef.current) return undefined;

    const targetRect = inputRef.current.getBoundingClientRect();
    const firstFrame = {
      position: 'fixed',
      left: initialRect.left,
      top: initialRect.top,
      bottom: 'auto',
      width: initialRect.width,
      height: initialRect.height,
      maxWidth: 'none',
      transform: 'none',
      opacity: 1,
      animation: 'none',
      transition: 'none'
    };
    setInputMotionStyle(firstFrame);

    const frame = requestAnimationFrame(() => {
      setInputMotionStyle({
        ...firstFrame,
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        transition: 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1), top 0.8s cubic-bezier(0.22, 1, 0.36, 1), width 0.8s cubic-bezier(0.22, 1, 0.36, 1), height 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      });
    });
    const done = window.setTimeout(() => setIsReady(true), 850);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(done);
    };
  }, [initialRect]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      speechRecognition.onerror = () => setIsListening(false);
      speechRecognition.onend = () => setIsListening(false);
      setRecognition(speechRecognition);
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice((current) => current || availableVoices.find((voice) => voice.default)?.name || availableVoices[0]?.name || '');
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else {
      recognition.start();
      setIsListening(true);
    }
  };

  const clearChat = () => setMessages([]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a professional, helpful AI assistant. Respond clearly using markdown.' },
          ...messages,
          userMessage
        ]
      });
      const answer = cleanResponse(completion.choices[0]?.message?.content)
        || 'I could not generate a response.';
      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error(error);
      setMessages((current) => [...current, {
        role: 'assistant',
        content: 'I could not connect to Groq. Please check your API key and try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`landing-page landing-chatbot ${isReady ? 'landing-chat-ready' : ''}`}>
      <header className="landing-chatbot-header">
        <div className="landing-brand"><Cpu size={24} /><span>Groq Chat</span></div>
        <div className="landing-chat-options">
          <select value={selectedVoice} onChange={(event) => setSelectedVoice(event.target.value)} aria-label="Select voice">
            {voices.length === 0 && <option value="">Voice selection</option>}
            {voices.map((voice) => <option key={voice.name} value={voice.name}>{voice.name}</option>)}
          </select>
          <button type="button" onClick={toggleListening} title={recognition ? 'Voice input' : 'Voice input is not supported'}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button type="button" onClick={clearChat} title="Clear chat"><Trash2 size={18} /></button>
        </div>
      </header>
      <section className={`landing-chatbot-messages ${messages.length === 0 ? 'empty' : ''}`}>
        {messages.map((message, index) => (
          <div className={`landing-chat-message ${message.role}`} key={`${message.role}-${index}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <div className="landing-chat-message assistant">Thinking...</div>}
      </section>
      <form ref={inputRef} className="landing-chat-input" onSubmit={handleSend} style={inputMotionStyle}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Groq anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
          <Send size={19} />
        </button>
      </form>
    </main>
  );
}

export default LandingChatbot;
