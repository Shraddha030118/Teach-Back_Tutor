import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSessions } from '../services/api';
import Loading from '../components/Loading';
import { 
  History as HistoryIcon, 
  ArrowRight, 
  MessageSquare, 
  Award, 
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  BookOpen,
  BarChart3,
  TrendingUp,
  Brain
} from 'lucide-react';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/History.css';

const History = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'active'

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getSessions(user?.id);
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('Could not load session history. Please verify your backend server.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed');
    const completedCount = completed.length;
    const scores = completed
      .map(s => s.overall_score)
      .filter(sc => typeof sc === 'number' && !isNaN(sc));
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : null;

    return { total, completedCount, avgScore };
  }, [sessions]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Status filter
      if (statusFilter === 'completed' && s.status !== 'completed') return false;
      if (statusFilter === 'active' && s.status === 'completed') return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const topicMatch = s.topic?.toLowerCase().includes(query);
        const levelMatch = s.student_level?.toLowerCase().includes(query);
        return topicMatch || levelMatch;
      }
      return true;
    });
  }, [sessions, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="history-page-wrapper">
        <div className="history-top-strip">
          <div className="container history-top-container">
            <Link to="/" className="history-back-btn">
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </Link>
            <img src={teachBackTutorLogo} alt="Teach-Back Tutor" className="history-brand-logo" />
          </div>
        </div>
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <Loading message="Loading your teaching journey..." />
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-wrapper">
      {/* Top Header / Navigation Strip */}
      <div className="history-top-strip">
        <div className="container history-top-container">
          <Link to="/" className="history-back-btn" title="Back to Homepage">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThemeToggle />
            <img src={teachBackTutorLogo} alt="Teach-Back Tutor" className="history-brand-logo" />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Page Hero Header */}
        <div className="history-header-section">
          <div className="history-header-row">
            <div className="history-title-group">
              <div className="history-pill-tag">
                <Brain size={14} />
                <span>Metacognitive Records</span>
              </div>
              <h1 className="history-page-title">
                {isAuthenticated && user?.name ? `${user.name.split(' ')[0]}'s Teaching History` : 'Teaching History & Performance'}
              </h1>
              <p className="history-page-subtitle">
                {isAuthenticated 
                  ? `Review your previous teaching conversations, test-your-knowledge scores, and AI diagnostic reports.`
                  : `Review your teaching conversations and AI diagnostic reports. Create an account to permanently sync your progress.`}
              </p>
            </div>
            <Link to="/topics" className="btn btn-primary btn-lg">
              <span>+ New Teaching Session</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(79, 40, 217, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)',
            border: '1px solid rgba(79, 40, 217, 0.2)',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.92rem', color: '#334155' }}>
              💡 <strong>Guest Mode:</strong> You're currently browsing local sessions. <Link to="/login" style={{ color: '#4f28d9', fontWeight: '700' }}>Log In</Link> or <Link to="/register" style={{ color: '#4f28d9', fontWeight: '700' }}>Create an Account</Link> to save and access your teaching sessions anywhere.
            </div>
          </div>
        )}

        {error && (
          <div className="session-error-banner" style={{ marginBottom: '24px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Summary Cards */}
        {sessions.length > 0 && (
          <div className="history-metrics-grid">
            <div className="metric-stat-card">
              <div className="metric-icon-box icon-box-purple">
                <BookOpen size={22} />
              </div>
              <div className="metric-stat-details">
                <span className="metric-stat-num">{metrics.total}</span>
                <span className="metric-stat-label">Total Sessions</span>
              </div>
            </div>

            <div className="metric-stat-card">
              <div className="metric-icon-box icon-box-green">
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-stat-details">
                <span className="metric-stat-num">{metrics.completedCount}</span>
                <span className="metric-stat-label">Evaluated Reports</span>
              </div>
            </div>

            <div className="metric-stat-card">
              <div className="metric-icon-box icon-box-gold">
                <Award size={22} />
              </div>
              <div className="metric-stat-details">
                <span className="metric-stat-num">
                  {metrics.avgScore !== null ? `${metrics.avgScore}%` : 'N/A'}
                </span>
                <span className="metric-stat-label">Average Mastery Score</span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        {sessions.length > 0 && (
          <div className="history-controls-bar">
            <div className="history-search-box">
              <Search size={18} className="history-search-icon" />
              <input
                type="text"
                placeholder="Search topics (e.g. Photosynthesis, AI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="history-search-input"
              />
            </div>

            <div className="history-filter-pills">
              <button
                type="button"
                className={`history-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({sessions.length})
              </button>
              <button
                type="button"
                className={`history-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                Completed ({metrics.completedCount})
              </button>
              <button
                type="button"
                className={`history-filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                In Progress ({sessions.length - metrics.completedCount})
              </button>
            </div>
          </div>
        )}

        {/* Session Cards List */}
        {sessions.length === 0 ? (
          <div className="history-empty-card">
            <div className="history-empty-icon">
              <Sparkles size={32} />
            </div>
            <h3 className="history-empty-title">No teaching sessions recorded yet</h3>
            <p className="history-empty-desc">
              Master any concept by explaining it in simple terms to an AI student. 
              Start your first session to track your understanding over time.
            </p>
            <Link to="/topics" className="btn btn-primary btn-lg">
              <span>Choose a Topic to Teach</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="history-empty-card" style={{ padding: '40px 20px' }}>
            <h3 className="history-empty-title">No matching sessions found</h3>
            <p className="history-empty-desc">
              Try adjusting your search query or filter to see previous sessions.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="history-sessions-list">
            {filteredSessions.map((s) => {
              const isCompleted = s.status === 'completed';
              return (
                <div key={s.id} className="history-session-card">
                  <div className="session-main-info">
                    <div className="session-meta-row">
                      <span className="session-badge-level">{s.student_level || 'Beginner'}</span>
                      <span className="session-date-tag">
                        <Calendar size={14} />
                        <span>{formatDate(s.created_at)}</span>
                      </span>
                      <span className="session-msg-tag">
                        <MessageSquare size={14} />
                        <span>{s.message_count || 0} messages</span>
                      </span>
                      <span className={`session-status-tag ${isCompleted ? 'status-completed' : 'status-active'}`}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{isCompleted ? 'Report Available' : 'In Progress'}</span>
                      </span>
                    </div>

                    <h3 className="session-card-title">{s.topic}</h3>
                  </div>

                  <div className="session-right-side">
                    {s.overall_score !== null && s.overall_score !== undefined ? (
                      <div className="session-score-block">
                        <div className="session-score-value">{s.overall_score}%</div>
                        <div className="session-score-label">Mastery</div>
                      </div>
                    ) : null}

                    <Link
                      to={isCompleted ? `/report/${s.id}` : `/session/${s.id}`}
                      className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'} session-action-btn`}
                    >
                      <span>{isCompleted ? 'View Full Report' : 'Resume Session'}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
