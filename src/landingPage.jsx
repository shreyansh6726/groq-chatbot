import React from 'react';
import { ArrowRight, Cpu, MessageSquare, Sparkles } from 'lucide-react';
import BlurText from './BlurText';
import GradientButton from './GradientButton';
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
        <button className="landing-badge" type="button">
          <Sparkles size={15} />
          <span>Fast, intelligent <span className="conversation-word">conversations</span></span>
        </button>
        <BlurText
          text="Your ideas deserve a smarter conversation."
          delay={130}
          animateBy="words"
          direction="top"
          className="landing-heading"
          style={{
            width: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: 'clamp(1.4rem, 3.5vw, 2.7rem)'
          }}
        />
        <p>
          Meet Groq Elite, your professional AI assistant for clear answers,
          creative thinking, and getting more done.
        </p>
        <GradientButton onClick={onGetStarted} className="landing-cta">
          Get Started <ArrowRight size={20} />
        </GradientButton>

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
