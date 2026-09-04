import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu, Mic, MicOff } from 'lucide-react';
import ShinyText from './ShinyText';
import AnimatedList from './AnimatedList';
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
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
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
          <div className="voice-picker">
            <button
              className="voice-picker-trigger"
              type="button"
              onClick={() => setIsVoiceMenuOpen((open) => !open)}
              aria-expanded={isVoiceMenuOpen}
              aria-haspopup="listbox"
            >
              {selectedVoice || 'Voice selection'}
            </button>
            {isVoiceMenuOpen && (
              <div className="voice-picker-menu" role="listbox" aria-label="Select voice">
                {voices.length > 0 ? (
                  <AnimatedList
                    items={voices.map((voice) => voice.name)}
                    initialSelectedIndex={Math.max(voices.findIndex((voice) => voice.name === selectedVoice), -1)}
                    onItemSelect={(voice) => {
                      setSelectedVoice(voice);
                      setIsVoiceMenuOpen(false);
                    }}
                    showGradients
                    enableArrowNavigation
                    displayScrollbar={voices.length > 4}
                  />
                ) : <div className="voice-picker-empty">No voices available</div>}
              </div>
            )}
          </div>
          <button className="mic-button" type="button" onClick={toggleListening} title={recognition ? 'Voice input' : 'Voice input is not supported'}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button className="trash-button" type="button" onClick={clearChat} title="Clear chat" aria-label="Clear chat">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="trash-svg trash-top">
              <g clipPath="url(#trash-clip-top)">
                <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z" />
              </g>
              <defs><clipPath id="trash-clip-top"><rect fill="white" height="14" width="69" /></clipPath></defs>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="trash-svg trash-bottom">
              <g clipPath="url(#trash-clip-bottom)">
                <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z" />
              </g>
              <defs><clipPath id="trash-clip-bottom"><rect fill="white" height="57" width="69" /></clipPath></defs>
            </svg>
          </button>
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
      <form ref={inputRef} className="landing-chat-input chatbot-input-poda" onSubmit={handleSend} style={inputMotionStyle}>
        <div className="chatbot-input-glow" />
        <div className="chatbot-input-dark-border" />
        <div className="chatbot-input-dark-border" />
        <div className="chatbot-input-dark-border" />
        <div className="chatbot-input-white" />
        <div className="chatbot-input-border" />
        <div className="chatbot-input-main">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder=""
            disabled={isLoading}
          />
          {!input && !isLoading && (
            <ShinyText
              text="Ask anything to Groq"
              className="chatbot-input-placeholder"
              speed={2}
              color="#76BFE9"
              shineColor="#ffffff"
              spread={120}
              direction="left"
            />
          )}
          <div className="chatbot-input-mask" />
          <div className="chatbot-input-pink-mask" />
          <div className="chatbot-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <button className="landing-send-button" type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
            <span>send</span>
          </button>
        </div>
      </form>
    </main>
  );
}

export default LandingChatbot;
