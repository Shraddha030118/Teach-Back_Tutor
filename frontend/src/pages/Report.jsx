import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  RotateCcw, 
  ArrowLeft,
  BookOpen, 
  Sparkles,
  TrendingUp,
  Brain,
  Home,
  Check,
  Loader2,
  Printer
} from 'lucide-react';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import { getSessionById } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Report.css';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // State for fetched report (when navigated from History page via /report/:id)
  const [fetchedEvaluation, setFetchedEvaluation] = useState(null);
  const [fetchedTopic, setFetchedTopic] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // 1. Prefer data passed via router state (from live session)
  const evaluation = location.state?.evaluation || fetchedEvaluation;
  const topic = location.state?.topic || fetchedTopic || 'Topic Evaluation';

  // 2. If accessed via /report/:id (from History page), fetch from API
  useEffect(() => {
    if (!location.state?.evaluation && id) {
      const fetchReport = async () => {
        setIsFetching(true);
        setFetchError('');
        try {
          const data = await getSessionById(id);
          if (data?.evaluation) {
            setFetchedEvaluation(data.evaluation);
            setFetchedTopic(data.topic || '');
          } else {
            setFetchError('This session does not have an evaluation report yet.');
          }
        } catch (err) {
          console.error('Failed to fetch session report:', err);
          setFetchError('Could not load the evaluation report. Please check the backend server.');
        } finally {
          setIsFetching(false);
        }
      };
      fetchReport();
    }
  }, [id, location.state]);

  // Loading state while fetching by ID
  if (isFetching) {
    return (
      <div className="report-empty-state-page">
        <div className="report-empty-card">
          <div className="empty-icon-box" style={{ color: '#6366f1' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h2>Loading Evaluation Report...</h2>
          <p>Fetching your session data from the database.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="report-empty-state-page">
        <div className="report-empty-card">
          <div className="empty-icon-box"><AlertTriangle size={36} /></div>
          <h2>Could Not Load Report</h2>
          <p>{fetchError}</p>
          <div className="empty-actions">
            <Link to="/history" className="btn btn-secondary">View History</Link>
            <Link to="/topics" className="btn btn-primary">Start New Session</Link>
          </div>
        </div>
      </div>
    );
  }

  // No evaluation data at all
  if (!evaluation) {
    return (
      <div className="report-empty-state-page">
        <div className="report-empty-card">
          <div className="empty-icon-box">
            <Award size={36} />
          </div>
          <h2>No Evaluation Report Found</h2>
          <p>
            You need to complete a teaching session with the AI student to generate an evaluation report.
          </p>
          <div className="empty-actions">
            <Link to="/" className="btn btn-secondary">
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
            <Link to="/topics" className="btn btn-primary">
              <RotateCcw size={16} />
              <span>Start a Teaching Session</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Overall Performance (Average of the 3 core criteria out of 10)
  const clarity = Number(evaluation.clarity_score ?? 8);
  const understanding = Number(evaluation.understanding_score ?? 7);
  const accuracy = Number(evaluation.accuracy_score ?? 8);
  const averageOutOfTen = Math.round(((clarity + understanding + accuracy) / 3) * 10) / 10;
  const overallPercentage = Math.round((averageOutOfTen / 10) * 100);

  // Determine Performance Badge Label
  const getPerformanceRating = (score) => {
    if (score >= 8.5) return { label: 'Exceptional Mastery', tierClass: 'tier-gold' };
    if (score >= 7.0) return { label: 'Strong Understanding', tierClass: 'tier-purple' };
    if (score >= 5.5) return { label: 'Competent Explainer', tierClass: 'tier-blue' };
    return { label: 'Developing Foundations', tierClass: 'tier-amber' };
  };

  const performance = getPerformanceRating(averageOutOfTen);

  return (
    <div className="report-page-wrapper">
      {/* Top Header Strip */}
      <div className="report-top-strip no-print">
        <div className="container report-top-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" className="back-home-link" title="Return to Home">
              <ArrowLeft size={16} />
              <span>Home</span>
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="back-home-link"
              title="Print or Save Report as PDF"
              style={{ cursor: 'pointer', background: 'none', border: '1px solid #e2e8f0' }}
            >
              <Printer size={16} />
              <span>Save / Print</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThemeToggle />
            <img src={teachBackTutorLogo} alt="Teach-Back Tutor" className="report-brand-logo" />
          </div>
        </div>
      </div>

      <div className="container report-main-container">
        {/* Page Hero Header */}
        <div className="report-header-banner">
          <div className="report-pill badge-purple">
            <Sparkles size={14} />
            <span>Feynman Pedagogical Assessment</span>
          </div>
          <h1 className="report-title">Teaching Evaluation Report</h1>
          <p className="report-subtitle">
            Analysis for: <strong>{topic}</strong> • Evaluated by Google Gemini AI
          </p>
        </div>

        {/* 1. Overall Performance Hero Card */}
        <div className="report-hero-card">
          <div className="hero-score-dial-box">
            <div className="score-dial-circle">
              <span className="dial-score-num">{averageOutOfTen}</span>
              <span className="dial-max">/10</span>
            </div>
            <span className={`performance-tier-badge ${performance.tierClass}`}>
              {performance.label}
            </span>
          </div>

          <div className="hero-feedback-text">
            <div className="feedback-heading-row">
              <Brain size={20} className="icon-purple" />
              <h3>AI Evaluator Assessment</h3>
            </div>
            <p className="overall-feedback-content">
              {evaluation.overall_feedback || "The teacher demonstrated consistent effort in breaking down the concept to the AI student."}
            </p>
          </div>
        </div>

        {/* 2. Core Criteria Score Cards & Progress Indicators */}
        <div className="score-cards-grid">
          {/* Clarity Score Card */}
          <div className="criterion-card">
            <div className="criterion-header">
              <span className="criterion-title">Explanation Clarity</span>
              <span className="criterion-score-badge">{clarity} / 10</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill progress-purple" 
                style={{ width: `${(clarity / 10) * 100}%` }}
              ></div>
            </div>
            <p className="criterion-caption">
              Simplicity of language, use of everyday analogies, and clear structure.
            </p>
          </div>

          {/* Understanding Score Card */}
          <div className="criterion-card">
            <div className="criterion-header">
              <span className="criterion-title">Conceptual Understanding</span>
              <span className="criterion-score-badge">{understanding} / 10</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill progress-indigo" 
                style={{ width: `${(understanding / 10) * 100}%` }}
              ></div>
            </div>
            <p className="criterion-caption">
              Grasp of the underlying principles and responsiveness to follow-up questions.
            </p>
          </div>

          {/* Accuracy Score Card */}
          <div className="criterion-card">
            <div className="criterion-header">
              <span className="criterion-title">Factual Accuracy</span>
              <span className="criterion-score-badge">{accuracy} / 10</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill progress-teal" 
                style={{ width: `${(accuracy / 10) * 100}%` }}
              ></div>
            </div>
            <p className="criterion-caption">
              Technical correctness, absence of flawed logic, and precision of details.
            </p>
          </div>
        </div>

        {/* 3. Strengths & Knowledge Gaps Two-Column Section */}
        <div className="insights-two-col-grid">
          {/* Strengths Card */}
          <div className="insight-card strengths-card">
            <div className="insight-card-header">
              <div className="insight-icon-box icon-box-green">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3>Key Strengths</h3>
                <span className="insight-count">{evaluation.strengths?.length || 0} demonstrated</span>
              </div>
            </div>
            <ul className="insight-list">
              {evaluation.strengths && evaluation.strengths.length > 0 ? (
                evaluation.strengths.map((item, idx) => (
                  <li key={idx} className="strength-item">
                    <Check size={16} className="item-bullet-icon green-bullet" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="empty-insight-note">Keep practicing to build identifiable strengths!</li>
              )}
            </ul>
          </div>

          {/* Knowledge Gaps Card */}
          <div className="insight-card gaps-card">
            <div className="insight-card-header">
              <div className="insight-icon-box icon-box-amber">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3>Knowledge Gaps & Blind Spots</h3>
                <span className="insight-count">{evaluation.knowledge_gaps?.length || 0} identified</span>
              </div>
            </div>
            <ul className="insight-list">
              {evaluation.knowledge_gaps && evaluation.knowledge_gaps.length > 0 ? (
                evaluation.knowledge_gaps.map((item, idx) => (
                  <li key={idx} className="gap-item">
                    <span className="bullet-dot amber-bullet">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="empty-insight-note">No significant knowledge gaps detected!</li>
              )}
            </ul>
          </div>
        </div>

        {/* 4. Misconceptions Section */}
        <div className="misconceptions-section">
          {evaluation.misconceptions && evaluation.misconceptions.length > 0 ? (
            <div className="misconceptions-alert-card">
              <div className="misconceptions-header">
                <AlertTriangle size={22} className="alert-icon-red" />
                <h3>Detected Misconceptions</h3>
              </div>
              <ul className="misconceptions-list">
                {evaluation.misconceptions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="clean-misconceptions-card">
              <div className="clean-icon-box">
                <CheckCircle2 size={22} />
              </div>
              <div className="clean-text-box">
                <h4>No Misconceptions Detected</h4>
                <p>Your explanations maintained strong conceptual alignment without introducing flawed premises.</p>
              </div>
            </div>
          )}
        </div>

        {/* 5. Recommended Revision Topics */}
        {evaluation.revision_topics && evaluation.revision_topics.length > 0 && (
          <div className="revision-card">
            <div className="revision-header">
              <BookOpen size={20} className="icon-purple" />
              <h3>Recommended Revision Topics</h3>
            </div>
            <p className="revision-caption">
              Review these specific areas to solidify your mastery before teaching this again:
            </p>
            <div className="revision-chips-grid">
              {evaluation.revision_topics.map((topicItem, idx) => (
                <div key={idx} className="revision-topic-chip">
                  <span className="chip-index">{idx + 1}</span>
                  <span>{topicItem}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Footer Navigation Action Buttons */}
        <div className="report-actions-row">
          <Link to="/" className="btn btn-secondary btn-lg">
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>
          <Link to="/history" className="btn btn-secondary btn-lg">
            <Award size={18} />
            <span>Session History</span>
          </Link>
          <Link to="/topics" className="btn btn-primary btn-lg">
            <RotateCcw size={18} />
            <span>Start Another Session</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Report;
