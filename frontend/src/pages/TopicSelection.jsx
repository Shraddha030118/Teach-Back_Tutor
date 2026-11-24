import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Leaf, 
  HeartPulse, 
  Sun, 
  Brain, 
  Layers, 
  Database, 
  Code2, 
  Boxes, 
  GitBranch, 
  Landmark, 
  CloudRain, 
  Rocket,
  GraduationCap,
  BookOpen,
  Check,
  Search,
  X
} from 'lucide-react';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/TopicSelection.css';

const TOPIC_CATEGORIES = [
  {
    id: 'science',
    name: 'Science',
    badgeClass: 'badge-science',
    topics: [
      {
        id: 'photosynthesis',
        title: 'Photosynthesis',
        category: 'Science',
        icon: Leaf,
        description: 'How green plants transform sunlight, water, and CO2 into chemical energy and life-giving oxygen.'
      },
      {
        id: 'human-digestive-system',
        title: 'Human Digestive System',
        category: 'Science',
        icon: HeartPulse,
        description: 'The biological journey of food through organs, specialized enzymes, and nutrient absorption.'
      },
      {
        id: 'solar-system',
        title: 'Solar System',
        category: 'Science',
        icon: Sun,
        description: 'The Sun, eight planets, moons, asteroids, and orbital mechanics in our cosmic neighborhood.'
      }
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    badgeClass: 'badge-cs',
    topics: [
      {
        id: 'artificial-intelligence',
        title: 'Artificial Intelligence',
        category: 'Computer Science',
        icon: Brain,
        description: 'Machine learning, neural networks, and how modern computer systems simulate human cognition.'
      },
      {
        id: 'operating-systems',
        title: 'Operating Systems',
        category: 'Computer Science',
        icon: Layers,
        description: 'Process scheduling, virtual memory management, concurrency, and hardware abstraction.'
      },
      {
        id: 'dbms',
        title: 'Database Management Systems',
        category: 'Computer Science',
        icon: Database,
        description: 'Relational data models, SQL queries, transaction consistency, ACID rules, and index optimization.'
      }
    ]
  },
  {
    id: 'programming',
    name: 'Programming',
    badgeClass: 'badge-programming',
    topics: [
      {
        id: 'python-basics',
        title: 'Python Basics',
        category: 'Programming',
        icon: Code2,
        description: 'Variables, data types, control structures, functions, and clean idiomatic Python syntax.'
      },
      {
        id: 'oop',
        title: 'Object-Oriented Programming',
        category: 'Programming',
        icon: Boxes,
        description: 'Classes, objects, inheritance, polymorphism, encapsulation, and modular architectural design.'
      },
      {
        id: 'data-structures',
        title: 'Data Structures',
        category: 'Programming',
        icon: GitBranch,
        description: 'Arrays, linked lists, stacks, queues, trees, and algorithmic efficiency analysis.'
      }
    ]
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    badgeClass: 'badge-gk',
    topics: [
      {
        id: 'indian-history',
        title: 'Indian History',
        category: 'General Knowledge',
        icon: Landmark,
        description: 'Ancient civilizations, cultural evolution, the independence struggle, and the modern republic.'
      },
      {
        id: 'climate-change',
        title: 'Climate Change',
        category: 'General Knowledge',
        icon: CloudRain,
        description: 'Global warming dynamics, greenhouse gases, renewable energy transition, and ecological preservation.'
      },
      {
        id: 'space-exploration',
        title: 'Space Exploration',
        category: 'General Knowledge',
        icon: Rocket,
        description: 'Rocketry physics, lunar expeditions, Mars rovers, and humanity’s quest into deep space.'
      }
    ]
  }
];

const TopicSelection = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleSelectTopic = (topic) => {
    if (selectedTopic?.id === topic.id) {
      // Toggle off if already selected
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
    }
  };

  const handleContinue = () => {
    if (!selectedTopic) return;
    setShowConfirmationModal(true);
  };

  // Filtered categories and their topics based on category pill and search query
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const baseCats = activeCategoryFilter === 'all' 
      ? TOPIC_CATEGORIES 
      : TOPIC_CATEGORIES.filter(cat => cat.id === activeCategoryFilter);

    if (!query) return baseCats;

    return baseCats
      .map(cat => ({
        ...cat,
        topics: cat.topics.filter(t => 
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        )
      }))
      .filter(cat => cat.topics.length > 0);
  }, [activeCategoryFilter, searchQuery]);

  const totalMatchingTopics = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.topics.length, 0);
  }, [filteredCategories]);

  return (
    <div className="topic-selection-page">
      {/* Top Header / Navigation Strip */}
      <div className="topic-nav-strip">
        <div className="container topic-nav-container">
          <Link to="/" className="back-btn" title="Back to Homepage">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThemeToggle />
            <div className="topic-brand-badge">
              <img src={teachBackTutorLogo} alt="Teach-Back Tutor" className="topic-brand-logo" />
            </div>
          </div>
        </div>
      </div>

      <div className="container topic-main-container">
        {/* Page Hero Section */}
        <div className="topic-header-section">
          <div className="topic-pill-tag">
            <Sparkles size={14} />
            <span>Feynman Active Learning</span>
          </div>
          <h1 className="topic-page-title">
            What would you like to learn today?
          </h1>
          <p className="topic-page-subtitle">
            Choose a topic and explain it in your own words. Our AI student will ask questions to test your understanding.
          </p>

          {/* Category Filter Pills */}
          <div className="category-filter-bar">
            <button
              type="button"
              className={`category-pill ${activeCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategoryFilter('all')}
            >
              <span>All Categories</span>
              <span className="pill-count">12</span>
            </button>
            {TOPIC_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${activeCategoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="pill-count">{cat.topics.length}</span>
              </button>
            ))}
          </div>

          {/* Quick Search Bar */}
          <div className="topic-search-wrapper" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <div className="topic-search-container" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '10px 20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 2px 10px rgba(79, 40, 217, 0.06)'
            }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search topics (e.g. AI, Python, Photosynthesis)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: '#0f172a'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories and Topic Cards Grid */}
        <div className="categories-list">
          {filteredCategories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px dashed #cbd5e1',
              maxWidth: '540px',
              margin: '20px auto'
            }}>
              <BookOpen size={36} color="#7c3aed" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>No topics found</h3>
              <p style={{ color: '#64748b', fontSize: '0.96rem', marginBottom: '18px' }}>
                We couldn't find any topics matching "<strong>{searchQuery}</strong>". Try searching for something else.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setSearchQuery(''); setActiveCategoryFilter('all'); }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredCategories.map(cat => (
            <div key={cat.id} className="category-section">
              <div className="category-section-header">
                <span className={`category-tag-badge ${cat.badgeClass}`}>
                  {cat.name.toUpperCase()}
                </span>
                <span className="category-topic-count">3 Available Topics</span>
              </div>

              <div className="topics-grid">
                {cat.topics.map(topic => {
                  const Icon = topic.icon;
                  const isSelected = selectedTopic?.id === topic.id;

                  return (
                    <div
                      key={topic.id}
                      role="button"
                      tabIndex={0}
                      className={`topic-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectTopic(topic)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectTopic(topic);
                        }
                      }}
                    >
                      <div className="topic-card-header">
                        <div className={`topic-icon-wrapper ${isSelected ? 'active-icon' : ''}`}>
                          <Icon size={24} />
                        </div>
                        <div className={`selection-radio ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="topic-card-body">
                        <span className="topic-category-name">{topic.category}</span>
                        <h3 className="topic-title">{topic.title}</h3>
                        <p className="topic-description">{topic.description}</p>
                      </div>

                      <div className="topic-card-footer">
                        <span className="select-action-text">
                          {isSelected ? 'Selected' : 'Click to select'}
                        </span>
                        <ArrowRight size={14} className="card-arrow" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )))}
        </div>

        {/* In-page Continue Button Container */}
        <div className="bottom-continue-section">
          {selectedTopic ? (
            <div className="continue-prompt-card">
              <div className="prompt-left">
                <div className="prompt-icon">
                  <GraduationCap size={22} />
                </div>
                <div className="prompt-text">
                  <span className="prompt-label">Topic Selected:</span>
                  <span className="prompt-topic-name">{selectedTopic.title}</span>
                </div>
              </div>
              <button 
                type="button"
                className="btn btn-primary btn-lg continue-btn highlighted-btn"
                onClick={handleContinue}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="empty-selection-placeholder">
              <span>Select any topic above to continue</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Floating Bar when a topic is selected */}
      {selectedTopic && (
        <div className="sticky-selection-bar">
          <div className="container sticky-bar-inner">
            <div className="sticky-topic-info">
              <div className="sticky-check-badge">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <span className="sticky-tag">{selectedTopic.category}</span>
                <h4 className="sticky-topic-title">{selectedTopic.title}</h4>
              </div>
            </div>
            <button 
              type="button"
              className="btn btn-primary continue-btn sticky-continue-btn"
              onClick={handleContinue}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal when Continue is clicked */}
      {showConfirmationModal && selectedTopic && (
        <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">
              <GraduationCap size={32} />
            </div>
            <h3 className="modal-title">Ready to Teach?</h3>
            <p className="modal-desc">
              You selected <strong>"{selectedTopic.title}"</strong> ({selectedTopic.category}).
            </p>
            <div className="modal-instruction-box">
              <div className="instruction-step">
                <span className="step-num">1</span>
                <span>You will explain this topic in your own words.</span>
              </div>
              <div className="instruction-step">
                <span className="step-num">2</span>
                <span>Your AI student will ask curious follow-up questions.</span>
              </div>
              <div className="instruction-step">
                <span className="step-num">3</span>
                <span>Uncover knowledge gaps and receive detailed feedback!</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowConfirmationModal(false)}
              >
                Change Topic
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setShowConfirmationModal(false);
                  navigate('/session', {
                    state: {
                      topic: selectedTopic.title,
                      category: selectedTopic.category
                    }
                  });
                }}
              >
                <span>Enter Classroom</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSelection;

