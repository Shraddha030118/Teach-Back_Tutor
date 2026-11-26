import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  Sparkles,
  Target,
  BookOpen,
  Award,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  BarChart2,
  PieChart as PieIcon,
  ChevronRight,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getLearningProgress } from '../services/api';
import '../styles/Dashboard.css';

const PIE_COLORS = ['#20B8A5', '#5956D6', '#f59e0b'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProgress = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await getLearningProgress();
      setData(result);
    } catch (err) {
      console.error('Failed to load learning progress:', err);
      const detail = err.response?.data?.message || err.response?.data?.detail || 'Unable to retrieve your learning progress data.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  // Pie chart data preparation
  const distributionData = data?.performance_distribution ? [
    { name: 'Mastered (80–100%)', value: data.performance_distribution.mastered },
    { name: 'Proficient (60–79%)', value: data.performance_distribution.proficient },
    { name: 'Needs Work (<60%)', value: data.performance_distribution.needs_work }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-inner">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <div className="dashboard-pill">
              <BarChart2 size={14} />
              <span>Analytics & Mastery</span>
            </div>
            <h1 className="dashboard-title">Learning Progress Dashboard</h1>
            <p className="dashboard-subtitle">
              Visualize your conceptual mastery, retention gains, and topic performance based on actual teaching sessions.
            </p>
          </div>

          <div className="dashboard-actions">
            <button 
              onClick={fetchProgress} 
              className="dashboard-refresh-btn" 
              title="Refresh Analytics"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/topics" className="dashboard-cta-btn">
              <span>Teach a Topic</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="dashboard-loading-view">
            <div className="dashboard-spinner" />
            <p>Analyzing completed sessions & pedagogical evaluations...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="dashboard-error-banner" role="alert">
            <AlertTriangle size={20} />
            <div className="dashboard-error-content">
              <h4>Could not load analytics</h4>
              <p>{errorMessage}</p>
            </div>
            <button onClick={fetchProgress} className="dashboard-retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && (!data || !data.has_data || data.total_completed_sessions === 0) && (
          <div className="dashboard-empty-card">
            <div className="empty-icon-box">
              <Compass size={36} />
            </div>
            <h2>No Completed Sessions Yet</h2>
            <p>
              Your learning progress, mastery metrics, and pedagogical charts will automatically unlock once you complete and evaluate your first teaching session!
            </p>
            <div className="empty-action-row">
              <Link to="/topics" className="dashboard-primary-btn">
                <span>Start Teaching an AI Student</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Populated Dashboard Content */}
        {!isLoading && !errorMessage && data && data.has_data && (
          <div className="dashboard-content-grid">
            {/* 1. Summary Metric Cards */}
            <section className="metrics-row">
              <div className="metric-card">
                <div className="metric-card-top">
                  <span className="metric-label">Completed Sessions</span>
                  <div className="metric-icon-box purple">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="metric-value">{data.total_completed_sessions}</div>
                <div className="metric-subtext">Teaching sessions evaluated</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-top">
                  <span className="metric-label">Avg Understanding</span>
                  <div className="metric-icon-box blue">
                    <Brain size={20} />
                  </div>
                </div>
                <div className="metric-value">
                  {data.avg_understanding}
                  <span className="metric-denom">/10</span>
                </div>
                <div className="metric-subtext">
                  {(data.avg_understanding * 10).toFixed(0)}% comprehension depth
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-top">
                  <span className="metric-label">Avg Clarity</span>
                  <div className="metric-icon-box violet">
                    <Sparkles size={20} />
                  </div>
                </div>
                <div className="metric-value">
                  {data.avg_clarity}
                  <span className="metric-denom">/10</span>
                </div>
                <div className="metric-subtext">Structure & explanation ease</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-top">
                  <span className="metric-label">Avg Accuracy</span>
                  <div className="metric-icon-box emerald">
                    <Target size={20} />
                  </div>
                </div>
                <div className="metric-value">
                  {data.avg_accuracy}
                  <span className="metric-denom">/10</span>
                </div>
                <div className="metric-subtext">Factual & conceptual precision</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-top">
                  <span className="metric-label">Topics Explored</span>
                  <div className="metric-icon-box gold">
                    <BookOpen size={20} />
                  </div>
                </div>
                <div className="metric-value">{data.total_topics_explored}</div>
                <div className="metric-subtext">Unique concepts taught</div>
              </div>
            </section>

            {/* 2. Interactive Charts Section */}
            <section className="charts-grid">
              {/* Chart A: Learning Improvement Over Time */}
              <div className="chart-card wide-card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Learning Improvement Over Time</h3>
                    <p className="chart-desc">Tracking understanding, clarity, and accuracy scores chronologically</p>
                  </div>
                  <span className="chart-badge">Score (0–10)</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={290}>
                    <LineChart data={data.timeline} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card, #ffffff)',
                          borderColor: 'var(--border-light, #e2e8f0)',
                          borderRadius: '10px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }}
                        formatter={(val, name) => [val, name]}
                        labelFormatter={(lbl, items) => {
                          const topic = items?.[0]?.payload?.topic;
                          return topic ? `${topic} (${lbl})` : lbl;
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="understanding_score"
                        name="Understanding"
                        stroke="#5956D6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clarity_score"
                        name="Clarity"
                        stroke="#9290FF"
                        strokeWidth={2.5}
                        strokeDasharray="4 2"
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy_score"
                        name="Accuracy"
                        stroke="#20B8A5"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Topic-wise Performance */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Topic-wise Performance</h3>
                    <p className="chart-desc">Average overall score achieved across explored topics</p>
                  </div>
                  <span className="chart-badge">Score %</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={data.topic_performance} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="topic" 
                        angle={-20} 
                        textAnchor="end" 
                        interval={0} 
                        tick={{ fontSize: 11 }} 
                        stroke="#94a3b8" 
                      />
                      <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card, #ffffff)',
                          borderColor: 'var(--border-light, #e2e8f0)',
                          borderRadius: '10px'
                        }}
                        formatter={(val) => [`${val}%`, 'Overall Score']}
                      />
                      <Bar 
                        dataKey="avg_overall" 
                        name="Avg Overall Score" 
                        fill="url(#barGradient)" 
                        radius={[6, 6, 0, 0]} 
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5956D6" />
                          <stop offset="100%" stopColor="#20B8A5" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart C: Performance Distribution */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Mastery Distribution</h3>
                    <p className="chart-desc">Session completion breakdown by mastery tier</p>
                  </div>
                  <PieIcon size={18} className="chart-icon" />
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card, #ffffff)',
                          borderColor: 'var(--border-light, #e2e8f0)',
                          borderRadius: '10px'
                        }}
                        formatter={(val) => [`${val} sessions`, 'Count']}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* 3. Learning Insights Section */}
            <section className="insights-container">
              <div className="insights-header">
                <Sparkles size={20} className="sparkle-icon" />
                <h2>Personalized Learning Insights</h2>
                <span className="insights-caption">Aggregated from your actual Gemini pedagogical reports</span>
              </div>

              <div className="insights-cards-grid">
                {/* Strongest Topics */}
                <div className="insight-card positive">
                  <div className="insight-card-top">
                    <Award size={18} />
                    <h4>Strongest Topics</h4>
                  </div>
                  {data.strongest_topics && data.strongest_topics.length > 0 ? (
                    <div className="tags-cloud">
                      {data.strongest_topics.map((top, idx) => (
                        <span key={idx} className="insight-tag tag-strong">
                          <CheckCircle size={12} />
                          <span>{top}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-insight-note">Continue practicing to identify your core strengths.</p>
                  )}
                </div>

                {/* Topics Needing Improvement */}
                <div className="insight-card warning">
                  <div className="insight-card-top">
                    <TrendingUp size={18} />
                    <h4>Focus Areas for Improvement</h4>
                  </div>
                  {data.topics_needing_improvement && data.topics_needing_improvement.length > 0 ? (
                    <div className="tags-cloud">
                      {data.topics_needing_improvement.map((top, idx) => (
                        <span key={idx} className="insight-tag tag-warning">
                          <AlertTriangle size={12} />
                          <span>{top}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-insight-note">Great job! All explored topics show strong comprehension.</p>
                  )}
                </div>

                {/* Frequently Occurring Knowledge Gaps */}
                <div className="insight-card neutral">
                  <div className="insight-card-top">
                    <HelpCircle size={18} />
                    <h4>Recurring Knowledge Gaps</h4>
                  </div>
                  {data.frequent_knowledge_gaps && data.frequent_knowledge_gaps.length > 0 ? (
                    <ul className="insight-list">
                      {data.frequent_knowledge_gaps.map((gap, idx) => (
                        <li key={idx}>
                          <span className="bullet-dot" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-insight-note">No recurring knowledge gaps detected across your sessions.</p>
                  )}
                </div>

                {/* Misconceptions Identified */}
                <div className="insight-card caution">
                  <div className="insight-card-top">
                    <AlertTriangle size={18} />
                    <h4>Identified Misconceptions</h4>
                  </div>
                  {data.frequent_misconceptions && data.frequent_misconceptions.length > 0 ? (
                    <ul className="insight-list">
                      {data.frequent_misconceptions.map((misc, idx) => (
                        <li key={idx}>
                          <span className="bullet-dot red" />
                          <span>{misc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-insight-note">No conceptual misconceptions identified! Your explanations were factually solid.</p>
                  )}
                </div>

                {/* Suggested Topics for Revision */}
                <div className="insight-card revision full-span">
                  <div className="insight-card-top">
                    <RotateCcw size={18} />
                    <h4>Recommended Concepts for Revision</h4>
                  </div>
                  {data.suggested_revision_topics && data.suggested_revision_topics.length > 0 ? (
                    <div className="tags-cloud">
                      {data.suggested_revision_topics.map((rev, idx) => (
                        <Link 
                          to="/topics" 
                          key={idx} 
                          className="insight-tag tag-revision"
                          title="Click to teach this topic again"
                        >
                          <BookOpen size={12} />
                          <span>{rev}</span>
                          <ChevronRight size={12} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-insight-note">You are caught up! Ready to pick brand new topics to teach.</p>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Session History Integration Table */}
            <section className="dashboard-history-section">
              <div className="section-header-flex">
                <div>
                  <h2>Recent Evaluated Sessions</h2>
                  <p>Click any session to view its full pedagogical report and feedback</p>
                </div>
                <Link to="/history" className="view-all-link">
                  <span>View All Sessions</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="sessions-table-wrapper">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Date</th>
                      <th>Understanding</th>
                      <th>Clarity</th>
                      <th>Accuracy</th>
                      <th>Mastery</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_sessions.map((sess) => {
                      const score = sess.overall_score || 0;
                      const scoreBadgeClass = score >= 80 ? 'badge-high' : score >= 60 ? 'badge-mid' : 'badge-low';
                      return (
                        <tr key={sess.session_id}>
                          <td className="topic-col">
                            <span className="topic-name-cell">{sess.topic}</span>
                          </td>
                          <td className="date-col">{formatDate(sess.created_at)}</td>
                          <td className="score-col">{sess.understanding_score ?? '-'}/10</td>
                          <td className="score-col">{sess.clarity_score ?? '-'}/10</td>
                          <td className="score-col">{sess.accuracy_score ?? '-'}/10</td>
                          <td className="mastery-col">
                            <span className={`mastery-badge ${scoreBadgeClass}`}>
                              {score}%
                            </span>
                          </td>
                          <td className="action-col">
                            <Link 
                              to={`/report/${sess.session_id}`} 
                              className="view-report-table-btn"
                              title="Open Evaluation Report"
                            >
                              <span>View Report</span>
                              <ChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
