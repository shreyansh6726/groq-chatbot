import React from 'react';
import { ArrowRight, Cpu, MessageSquare, Sparkles } from 'lucide-react';
import './App.css';

function LandingPage({ onGetStarted }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <div className="landing-brand">
          <Cpu size={26} />
          <span>Groq Elite</span>
        </div>
        <button className="landing-nav-button" onClick={onGetStarted}>
          Get Started <ArrowRight size={17} />
        </button>
      </nav>

      <section className="landing-hero">
        <div className="landing-badge">
          <Sparkles size={15} /> Fast, intelligent conversations
        </div>
        <h1>Your ideas deserve a <span>smarter</span> conversation.</h1>
        <p>
          Meet Groq Elite, your professional AI assistant for clear answers,
          creative thinking, and getting more done.
        </p>
        <button className="landing-cta" onClick={onGetStarted}>
          Get Started <ArrowRight size={20} />
        </button>

        <div className="landing-preview">
          <div className="preview-header">
            <div className="preview-dots"><i /><i /><i /></div>
            <span>Groq Chatbot</span>
            <MessageSquare size={18} />
          </div>
          <div className="preview-message preview-bot">
            Hello! How can I assist you today?
          </div>
          <div className="preview-message preview-user">
            Help me turn my ideas into reality.
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
