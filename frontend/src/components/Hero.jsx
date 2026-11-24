import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Brain, CheckCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import '../styles/Hero.css';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const scrollToExplore = (e) => {
    e.preventDefault();
    const target = document.getElementById('start-learning') || document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg-decoration">
        <div className="blob blob-purple"></div>
        <div className="blob blob-gold"></div>
      </div>

      <div className="container hero-container">
        {/* Left Content Column */}
        <div className="hero-content">
          <div className="hero-tag badge badge-purple">
            <Sparkles size={15} />
            <span>The Feynman Technique in Action</span>
          </div>

          <h1 className="hero-heading">
            Learn by Teaching. <br />
            <span className="text-gradient">Discover What You Understand.</span>
          </h1>

          <p className="hero-description">
            The most effective way to master any complex subject isn't passive reading or re-watching lectures. 
            With the <strong>Teach-Back method</strong>, you take the teacher's seat and explain concepts in simple terms 
            to an inquisitive AI student. Unpack your thinking, answer curious follow-up questions, 
            and effortlessly illuminate your knowledge gaps.
          </p>

          <div className="hero-cta-group">
            <Link 
              to={isAuthenticated ? "/topics" : "/login"} 
              state={{ from: '/topics' }}
              className="btn btn-primary btn-lg hero-primary-btn"
            >
              <span>Start Learning</span>
              <ArrowRight size={18} />
            </Link>

            <a 
              href="#how-it-works" 
              className="btn btn-secondary btn-lg hero-secondary-btn"
            >
              <span>How It Works</span>
            </a>
          </div>

          {/* Social Proof / Key Highlights */}
          <div className="hero-metrics">
            <div className="metric-pill">
              <CheckCircle size={16} className="metric-icon-success" />
              <span>Active Synthesis</span>
            </div>
            <div className="metric-pill">
              <CheckCircle size={16} className="metric-icon-success" />
              <span>Zero-Judgment Feedback</span>
            </div>
            <div className="metric-pill">
              <CheckCircle size={16} className="metric-icon-success" />
              <span>90% Retention Rate</span>
            </div>
          </div>
        </div>

        {/* Right Graphic Column */}
        <div className="hero-visual">
          <div className="hero-illustration-card">
            {/* Mascot Graphic Image */}
            <div className="illustration-wrapper">
              <img 
                src={teachBackTutorLogo} 
                alt="Teach-Back Tutor - Learn by Teaching" 
                className="hero-main-img"
              />
            </div>

            {/* Floating Interactive Micro-Cards */}
            <div className="floating-card floating-card-top">
              <div className="float-icon-gold">
                <Brain size={18} />
              </div>
              <div className="float-text">
                <span className="float-label">Feynman Method</span>
                <span className="float-val">Active Recall</span>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <div className="float-icon-purple">
                <HelpCircle size={18} />
              </div>
              <div className="float-text">
                <span className="float-label">AI Student</span>
                <span className="float-val">"Can you give an analogy?"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
