import React from 'react';
import { GraduationCap, Heart, ArrowUp } from 'lucide-react';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import '../styles/Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src={teachBackTutorLogo} alt="Teach-Back Tutor" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">
              "Don't just learn. Teach to understand."
            </p>
            <p className="footer-bio">
              An intelligent learning environment inspired by the Feynman Technique. 
              Explain concepts to an AI student, eliminate misconceptions, and achieve true understanding.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">About the Purpose</a></li>
              <li><a href="#start-learning">Start Learning</a></li>
            </ul>
          </div>

          {/* Methodologies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Pedagogical Science</h4>
            <ul className="footer-links">
              <li><span className="footer-static-link">The Feynman Technique</span></li>
              <li><span className="footer-static-link">Active Retrieval Practice</span></li>
              <li><span className="footer-static-link">Elaborative Interrogation</span></li>
              <li><span className="footer-static-link">Metacognitive Calibration</span></li>
            </ul>
          </div>

          {/* Learning Domains */}
          <div className="footer-col">
            <h4 className="footer-col-title">Popular Domains</h4>
            <ul className="footer-links">
              <li><span className="footer-static-link">Computer Science & AI</span></li>
              <li><span className="footer-static-link">Physics & Mathematics</span></li>
              <li><span className="footer-static-link">Biology & Medicine</span></li>
              <li><span className="footer-static-link">Economics & Strategy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} Teach-Back Tutor. All rights reserved.
          </div>
          <button 
            onClick={scrollToTop} 
            className="back-to-top-btn" 
            title="Scroll to top"
          >
            <span>Back to top</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
