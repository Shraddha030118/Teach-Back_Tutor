import React from 'react';
import { ShieldCheck, Target, Zap, Users, Quote, CheckCircle } from 'lucide-react';
import '../styles/About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-tag badge badge-gold">
            <span>Our Pedagogical Purpose</span>
          </div>
          <h2 className="section-title">
            About <span className="text-gradient">Teach-Back Tutor</span>
          </h2>
          <p className="section-subtitle">
            Bridging the chasm between the illusion of knowing and genuine conceptual mastery.
          </p>
        </div>

        {/* Narrative & Quote Grid */}
        <div className="about-narrative-grid">
          <div className="about-text-card">
            <h3 className="about-card-title">The Illusion of Competence</h3>
            <p className="about-paragraph">
              Have you ever read a textbook chapter, highlighted paragraphs, watched hours of video tutorials, 
              and felt confident—only to completely freeze when someone asked you to explain it from scratch?
            </p>
            <p className="about-paragraph">
              Cognitive scientists call this the <em>Illusion of Competence</em>. Re-reading and passive listening 
              are deceptive; they create fluency with the words, but not real mental ownership of the ideas.
            </p>
            <p className="about-paragraph">
              <strong>Teach-Back Tutor</strong> was built to solve this exact problem. By flipping the script 
              and placing you as the instructor, you are forced to synthesize, structure, and articulate 
              your thoughts in real time.
            </p>
          </div>

          <div className="about-quote-card">
            <div className="quote-icon-wrapper">
              <Quote size={32} />
            </div>
            <blockquote className="quote-content">
              "If you want to master something, teach it. If you can't explain it simply, you don't understand it well enough."
            </blockquote>
            <div className="quote-author">
              <div className="author-info">
                <strong>Richard Feynman</strong>
                <span>Nobel Laureate in Physics & Master Educator</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="pillars-grid">
          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Zap size={22} />
            </div>
            <h4>Active Brain Synthesis</h4>
            <p>Forces your brain to retrieve knowledge, form fresh neural pathways, and build durable memories that resist decay.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <ShieldCheck size={22} />
            </div>
            <h4>Safe, Judgment-Free Space</h4>
            <p>Teach without embarrassment. Your AI student is patient, polite, and solely focused on helping you articulate your ideas.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Target size={22} />
            </div>
            <h4>Instant Diagnostic Insight</h4>
            <p>Immediate objective feedback detects vague jargon, logical leaps, and blind spots before your real exams or interviews.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Users size={22} />
            </div>
            <h4>Universal Applicability</h4>
            <p>Works for any discipline: software architecture, medicine, history, machine learning, mathematics, or philosophy.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
