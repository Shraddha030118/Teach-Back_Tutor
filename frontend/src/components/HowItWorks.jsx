import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import '../styles/HowItWorks.css';

const steps = [
  {
    number: "01",
    tag: "Step One",
    title: "Choose a Topic",
    description: "Select any subject, framework, or concept you want to deeply master—from algorithms and biology to economics and physics.",
    highlights: [
      "Select your custom difficulty level",
      "Pick from trending curated topics",
      "Set your own learning objectives"
    ],
    icon: BookOpen,
    accent: "purple"
  },
  {
    number: "02",
    tag: "Step Two",
    title: "Teach the AI Student",
    description: "Take the teacher's podium. Break down the concept into plain, jargon-free explanations while your inquisitive AI student listens and asks questions.",
    highlights: [
      "Practice formulating simple analogies",
      "Answer clarifying 'Why' & 'What if' queries",
      "Experience realistic classroom dynamics"
    ],
    icon: MessageSquare,
    accent: "gold"
  },
  {
    number: "03",
    tag: "Step Three",
    title: "Discover Your Knowledge Gaps",
    description: "Receive instant, objective pedagogical analysis on your conceptual clarity, technical accuracy, and blind spots you overlooked.",
    highlights: [
      "Comprehensive Clarity & Depth Score",
      "Uncovered misconceptions highlighted",
      "Personalized review recommendations"
    ],
    icon: Lightbulb,
    accent: "teal"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag badge badge-purple">
            <span>The 3-Step Methodology</span>
          </div>
          <h2 className="section-title">
            How Teach-Back Tutor <span className="text-gradient">Transforms Learning</span>
          </h2>
          <p className="section-subtitle">
            Ground-up active recall powered by the time-tested Feynman Technique. 
            Here is your path to true conceptual mastery.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className={`step-card step-card-${step.accent}`}>
                <div className="step-card-header">
                  <div className="step-number-badge">{step.number}</div>
                  <div className={`step-icon-box icon-${step.accent}`}>
                    <Icon size={24} />
                  </div>
                </div>

                <div className="step-content">
                  <span className="step-tag-text">{step.tag}</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>

                  <ul className="step-highlights">
                    {step.highlights.map((item, hIdx) => (
                      <li key={hIdx}>
                        <CheckCircle2 size={16} className={`highlight-icon icon-${step.accent}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="step-bottom-bar"></div>
              </div>
            );
          })}
        </div>

        {/* Quick CTA strip */}
        <div className="how-cta-strip">
          <div className="cta-strip-text">
            <h4>Ready to test your understanding on your favorite topic?</h4>
            <p>Start a session in under 30 seconds with no complex setup.</p>
          </div>
          <Link to="/topics" className="btn btn-primary cta-strip-btn">
            <span>Choose Your Topic</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
