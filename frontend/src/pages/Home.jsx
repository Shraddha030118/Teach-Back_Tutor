import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  BookOpen, 
  GraduationCap, 
  HelpCircle,
  Cpu,
  Atom,
  TrendingUp,
  Code
} from 'lucide-react';
import '../styles/Home.css';

const CURATED_TOPICS = [
  { 
    title: "How HTTP and HTTPS Work", 
    category: "Web & Security", 
    icon: Code,
    summary: "Explain certificates, handshakes, and public/private key encryption."
  },
  { 
    title: "Recursion & Call Stack", 
    category: "Computer Science", 
    icon: Cpu,
    summary: "Base cases, recursive steps, and how the call stack prevents infinite loops."
  },
  { 
    title: "Photosynthesis & Energy Transfer", 
    category: "Biology", 
    icon: Lightbulb,
    summary: "Light-dependent reactions and glucose creation in simple terms."
  },
  { 
    title: "General Relativity & Spacetime", 
    category: "Physics", 
    icon: Atom,
    summary: "How mass curves the fabric of space and gives rise to gravity."
  },
  { 
    title: "Supply & Demand Equilibrium", 
    category: "Economics", 
    icon: TrendingUp,
    summary: "Price elasticity, market equilibrium, and surplus vs shortage."
  },
  { 
    title: "Neural Networks & Backpropagation", 
    category: "Artificial Intelligence", 
    icon: GraduationCap,
    summary: "Weights, activations, loss calculation, and gradient descent."
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [studentLevel, setStudentLevel] = useState('Beginner');
  const [noticeMessage, setNoticeMessage] = useState('');

  const handleStartPractice = (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setNoticeMessage('Please choose or enter a topic you would like to teach.');
      return;
    }

    navigate('/session', {
      state: {
        topic: topic.trim(),
        studentLevel,
        category: 'Custom Topic'
      }
    });
  };

  const handleSelectPreset = (presetTitle) => {
    setTopic(presetTitle);
    setNoticeMessage('');
  };

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. How It Works Section */}
      <HowItWorks />

      {/* 3. Interactive Topic Launcher / Start Learning Section */}
      <section id="start-learning" className="start-learning-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag badge badge-purple">
              <span>Interactive Classroom</span>
            </div>
            <h2 className="section-title">
              Ready to Teach? <span className="text-gradient">Choose Your Topic</span>
            </h2>
            <p className="section-subtitle">
              Pick a subject you want to master. Configure your AI student's persona and test your mastery.
            </p>
          </div>

          <div className="start-learning-card">
            <form onSubmit={handleStartPractice} className="topic-form">
              <div className="input-group">
                <label htmlFor="topic-input" className="input-label">
                  What concept or topic do you want to teach?
                </label>
                <div className="input-wrapper">
                  <input
                    id="topic-input"
                    type="text"
                    className="topic-text-input"
                    placeholder="e.g. How does a database index work? or The Prisoner's Dilemma"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      if (noticeMessage) setNoticeMessage('');
                    }}
                  />
                </div>
              </div>

              {/* Student Persona Selector */}
              <div className="input-group">
                <label className="input-label">
                  Student Persona & Understanding Level
                </label>
                <div className="persona-grid">
                  {[
                    { 
                      level: 'Beginner', 
                      title: 'Curious Novice', 
                      desc: 'Needs intuitive everyday analogies and plain, jargon-free explanations.' 
                    },
                    { 
                      level: 'Intermediate', 
                      title: 'Attentive Student', 
                      desc: 'Understands core terms, asks probing questions about edge cases.' 
                    },
                    { 
                      level: 'Advanced', 
                      title: 'Skeptical Peer', 
                      desc: 'Challenges trade-offs, theoretical nuances, and architectural limits.' 
                    }
                  ].map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setStudentLevel(item.level)}
                      className={`persona-card ${studentLevel === item.level ? 'active' : ''}`}
                    >
                      <div className="persona-header">
                        <span className="persona-level">{item.level}</span>
                        <span className="persona-title">{item.title}</span>
                      </div>
                      <p className="persona-desc">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {noticeMessage && (
                <div className="launch-notice-box">
                  <Sparkles size={18} className="notice-icon" />
                  <span>{noticeMessage}</span>
                </div>
              )}

              <div className="form-submit-container">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg start-session-submit-btn"
                >
                  <span>Launch Teaching Classroom</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            {/* Curated Presets Strip */}
            <div className="curated-presets-section">
              <div className="presets-title-bar">
                <BookOpen size={16} />
                <span>Or select one of these curated topics:</span>
              </div>

              <div className="curated-grid">
                {CURATED_TOPICS.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={index}
                      className={`curated-card ${topic === item.title ? 'selected' : ''}`}
                      onClick={() => handleSelectPreset(item.title)}
                    >
                      <div className="curated-top">
                        <span className="curated-cat">{item.category}</span>
                        <ItemIcon size={16} className="curated-icon" />
                      </div>
                      <h4 className="curated-name">{item.title}</h4>
                      <p className="curated-summary">{item.summary}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/topics" className="btn btn-secondary">
                  <span>Browse All 12 Topics Across 4 Categories</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Section */}
      <About />
    </div>
  );
};

export default Home;
