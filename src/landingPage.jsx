import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, MessageSquare, Sparkles } from 'lucide-react';
import BlurText from './BlurText';
import GradientButton from './GradientButton';
import PearlButton from './PearlButton';
import LandingChatbot from './LandingChatbot';
import './App.css';

function LandingPage({ onGetStarted }) {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [exitStage, setExitStage] = useState('idle');
  const [showChatbot, setShowChatbot] = useState(null);

  const handleGetStarted = () => {
    if (exitStage !== 'idle') return;
    setExitStage('rest');
  };

  if (showChatbot) return <LandingChatbot initialRect={showChatbot} />;

  return (
    <main className="landing-page">
      <motion.nav
        className="landing-nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: showRest && exitStage === 'idle' ? 1 : 0 }}
        style={{ pointerEvents: showRest && exitStage === 'idle' ? 'auto' : 'none' }}
        transition={{ duration: exitStage === 'rest' ? 0.35 : 0.7, ease: 'easeOut' }}
        onAnimationComplete={() => {
          if (exitStage === 'rest') setExitStage('heading');
        }}
      >
        <div className="landing-brand">
          <Cpu size={26} />
          <span>Groq Chat</span>
        </div>
        <PearlButton onClick={() => window.location.assign('https://harshita-liard.vercel.app/')}>
          About
        </PearlButton>
      </motion.nav>

      <section className="landing-hero">
        <motion.div
          className="landing-heading-wrap"
          animate={exitStage === 'heading' || exitStage === 'preview'
            ? { opacity: 0, y: -90, scale: 1.2 }
            : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: exitStage === 'heading' ? 0.9 : 0.2, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (exitStage === 'heading') setExitStage('preview');
          }}
        >
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
            onAnimationComplete={() => setShowSubtitle(true)}
          />
        </motion.div>
        <motion.p
          className="landing-subtitle"
          initial={{ opacity: 0, y: 24 }}
          animate={exitStage === 'heading' || exitStage === 'preview'
            ? { opacity: 0, y: -90, scale: 1.2 }
            : showSubtitle ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 1 }}
          transition={{ duration: exitStage === 'heading' ? 0.9 : 0.7, ease: 'easeInOut' }}
          onAnimationComplete={showSubtitle ? () => setShowRest(true) : undefined}
        >
          Meet Groq Elite, your professional AI assistant for clear answers,
          creative thinking, and getting more done.
        </motion.p>
        <motion.button
          className="landing-badge"
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: showRest && exitStage === 'idle' ? 1 : 0 }}
          style={{ pointerEvents: showRest && exitStage === 'idle' ? 'auto' : 'none' }}
          transition={{ duration: exitStage === 'rest' ? 0.35 : 0.7, ease: 'easeOut' }}
        >
              <Sparkles size={15} />
              <span>Fast, intelligent <span className="conversation-word">conversations</span></span>
        </motion.button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showRest && exitStage === 'idle' ? 1 : 0 }}
          style={{ pointerEvents: showRest && exitStage === 'idle' ? 'auto' : 'none' }}
          transition={{ duration: exitStage === 'rest' ? 0.35 : 0.7, ease: 'easeOut', delay: exitStage === 'idle' ? 0.12 : 0 }}
        >
          <GradientButton onClick={handleGetStarted} className="landing-cta">
            Get Started <ArrowRight size={20} />
          </GradientButton>
        </motion.div>
        <motion.div
          className="landing-preview"
          initial={{ opacity: 0 }}
          style={{
            width: 'min(620px, calc(100% - 48px))',
            maxWidth: exitStage === 'preview' ? 'none' : 620,
            overflow: exitStage === 'preview' ? 'hidden' : 'visible'
          }}
          animate={exitStage === 'preview'
            ? { opacity: 1, width: 'min(900px, calc(100vw - 48px))', height: 100, borderRadius: 12 }
            : { opacity: showRest ? 1 : 0, width: 'min(620px, calc(100% - 48px))', height: 'auto', borderRadius: 16 }}
          transition={exitStage === 'preview'
            ? { duration: 0.8, ease: 'easeInOut' }
            : { duration: 0.7, ease: 'easeOut', delay: 0.24 }}
          onAnimationComplete={() => {
            if (exitStage === 'preview') {
              const rect = document.querySelector('.landing-preview')?.getBoundingClientRect();
              setShowChatbot(rect ? {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
              } : {});
            }
          }}
        >
              <div className="preview-header">
                <div className="preview-dots"><i /><i /><i /></div>
                <span>Groq Chatbot</span>
                <MessageSquare size={18} />
              </div>
              <motion.div
                className="preview-message preview-bot"
                animate={exitStage === 'preview' ? { opacity: 0, y: 80 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.9, 0, 1, 0.1] }}
              >
                Hello! How can I assist you today?
              </motion.div>
              <motion.div
                className="preview-message preview-user"
                animate={exitStage === 'preview' ? { opacity: 0, y: 80 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05, ease: [0.9, 0, 1, 0.1] }}
              >
                Help me turn my ideas into reality.
              </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

export default LandingPage;
