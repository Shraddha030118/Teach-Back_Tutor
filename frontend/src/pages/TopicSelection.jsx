import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Leaf, 
  HeartPulse, 
  Sun, 
  Atom,
  Dna,
  FlaskConical,
  Brain, 
  Layers, 
  Database,
  Network,
  Cpu,
  ShieldCheck,
  Cloud,
  Code2, 
  Boxes, 
  GitBranch,
  Binary,
  Globe,
  GitCommit,
  Calculator,
  TrendingUp,
  Percent,
  Hash,
  Compass,
  Sigma,
  Puzzle,
  Clock,
  Shuffle,
  BarChart3,
  ListOrdered,
  Users,
  Bot,
  SlidersHorizontal,
  GitFork,
  Target,
  Landmark, 
  CloudRain, 
  Rocket,
  Globe2,
  Coins,
  Scale,
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
    icon: FlaskConical,
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
      },
      {
        id: 'newtons-laws',
        title: "Newton's Laws of Motion",
        category: 'Science',
        icon: Atom,
        description: 'Inertia, force-mass acceleration, and action-reaction pairs governing classical mechanics.'
      },
      {
        id: 'cell-structure-mitosis',
        title: 'Cell Structure & Mitosis',
        category: 'Science',
        icon: Dna,
        description: 'Organelles, eukaryotic vs. prokaryotic cells, and the phases of cellular division.'
      },
      {
        id: 'chemical-bonding',
        title: 'Chemical Bonding & Periodic Table',
        category: 'Science',
        icon: FlaskConical,
        description: 'Ionic, covalent, and metallic bonds, valence electrons, and periodic trends.'
      }
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: Cpu,
    badgeClass: 'badge-cs',
    topics: [
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
      },
      {
        id: 'computer-networks',
        title: 'Computer Networks & TCP/IP',
        category: 'Computer Science',
        icon: Network,
        description: 'OSI layers, packet routing, DNS resolution, HTTP protocols, and reliable transport.'
      },
      {
        id: 'computer-architecture',
        title: 'Computer Architecture & CPU',
        category: 'Computer Science',
        icon: Cpu,
        description: 'Fetch-decode-execute cycles, instruction pipelining, cache hierarchy, and ALU design.'
      },
      {
        id: 'cybersecurity-encryption',
        title: 'Cybersecurity & Encryption',
        category: 'Computer Science',
        icon: ShieldCheck,
        description: 'Symmetric vs. asymmetric cryptography, hashing, TLS handshakes, and common vulnerabilities.'
      },
      {
        id: 'cloud-computing',
        title: 'Cloud Computing & Distributed Systems',
        category: 'Computer Science',
        icon: Cloud,
        description: 'Load balancing, horizontal scaling, CAP theorem, microservices, and fault tolerance.'
      }
    ]
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: Code2,
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
      },
      {
        id: 'algorithms-bigo',
        title: 'Algorithms & Big-O Complexity',
        category: 'Programming',
        icon: Binary,
        description: 'Sorting, binary search, recursion, dynamic programming, and time-space tradeoffs.'
      },
      {
        id: 'web-dev-rest-apis',
        title: 'Web Development & REST APIs',
        category: 'Programming',
        icon: Globe,
        description: 'HTTP methods, status codes, JSON payloads, stateless authentication, and client-server flow.'
      },
      {
        id: 'git-version-control',
        title: 'Git & Version Control',
        category: 'Programming',
        icon: GitCommit,
        description: 'Commits, branching strategies, merging vs. rebasing, pull requests, and conflict resolution.'
      }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: Calculator,
    badgeClass: 'badge-math',
    topics: [
      {
        id: 'linear-algebra',
        title: 'Linear Algebra & Matrices',
        category: 'Mathematics',
        icon: Calculator,
        description: 'Vectors, matrix transformations, dot products, determinants, and eigenvalues.'
      },
      {
        id: 'calculus-derivatives-integrals',
        title: 'Calculus: Derivatives & Integrals',
        category: 'Mathematics',
        icon: Sigma,
        description: 'Limits, rates of change, optimization, area under curves, and the fundamental theorem.'
      },
      {
        id: 'probability-bayes',
        title: "Probability & Bayes' Theorem",
        category: 'Mathematics',
        icon: Percent,
        description: 'Conditional probability, random variables, distributions, and updating beliefs with evidence.'
      },
      {
        id: 'number-theory',
        title: 'Number Theory & Prime Numbers',
        category: 'Mathematics',
        icon: Hash,
        description: 'Divisibility, modular arithmetic, prime factorization, and Euclidean algorithms.'
      },
      {
        id: 'trigonometry-geometry',
        title: 'Trigonometry & Geometry',
        category: 'Mathematics',
        icon: Compass,
        description: 'Sine, cosine, unit circle identities, triangles, and spatial coordinate proofs.'
      },
      {
        id: 'differential-equations',
        title: 'Differential Equations',
        category: 'Mathematics',
        icon: TrendingUp,
        description: 'Modeling continuous change, first-order ODEs, exponential growth, and equilibrium.'
      }
    ]
  },
  {
    id: 'aptitude-reasoning',
    name: 'Aptitude & Reasoning',
    icon: Puzzle,
    badgeClass: 'badge-aptitude',
    topics: [
      {
        id: 'logical-syllogisms',
        title: 'Logical Syllogisms & Deduction',
        category: 'Aptitude & Reasoning',
        icon: Puzzle,
        description: 'Venn diagrams, deductive validity, conditional statements, and logical fallacies.'
      },
      {
        id: 'time-speed-work',
        title: 'Time, Speed & Work Problems',
        category: 'Aptitude & Reasoning',
        icon: Clock,
        description: 'Relative speed, average velocity, combined work rates, and pipes-and-cisterns logic.'
      },
      {
        id: 'permutations-combinations',
        title: 'Permutations & Combinations',
        category: 'Aptitude & Reasoning',
        icon: Shuffle,
        description: 'Counting principles, factorials, arrangement vs. selection, and constraint problems.'
      },
      {
        id: 'data-interpretation',
        title: 'Data Interpretation & Ratios',
        category: 'Aptitude & Reasoning',
        icon: BarChart3,
        description: 'Percentage growth, weighted averages, ratios, and extracting insights from charts.'
      },
      {
        id: 'number-letter-series',
        title: 'Number & Pattern Series',
        category: 'Aptitude & Reasoning',
        icon: ListOrdered,
        description: 'Arithmetic/geometric progressions, alternating patterns, and sequence prediction.'
      },
      {
        id: 'blood-relations-seating',
        title: 'Blood Relations & Seating Puzzles',
        category: 'Aptitude & Reasoning',
        icon: Users,
        description: 'Family tree mapping, linear/circular arrangements, and multi-constraint deduction.'
      }
    ]
  },
  {
    id: 'ai-data-science',
    name: 'Artificial Intelligence & Data Science',
    icon: Brain,
    badgeClass: 'badge-ai',
    topics: [
      {
        id: 'machine-learning-fundamentals',
        title: 'Machine Learning Fundamentals',
        category: 'Artificial Intelligence & Data Science',
        icon: Brain,
        description: 'Training data, feature representations, loss functions, gradient descent, and generalization.'
      },
      {
        id: 'neural-networks-deep-learning',
        title: 'Neural Networks & Deep Learning',
        category: 'Artificial Intelligence & Data Science',
        icon: Bot,
        description: 'Perceptrons, activation functions, backpropagation, CNNs, and modern deep architectures.'
      },
      {
        id: 'nlp-llms',
        title: 'Natural Language Processing & LLMs',
        category: 'Artificial Intelligence & Data Science',
        icon: Sparkles,
        description: 'Tokenization, word embeddings, self-attention transformers, and generative language models.'
      },
      {
        id: 'data-preprocessing-features',
        title: 'Data Preprocessing & Feature Engineering',
        category: 'Artificial Intelligence & Data Science',
        icon: SlidersHorizontal,
        description: 'Handling missing values, normalization, encoding, outlier removal, and dimensionality reduction.'
      },
      {
        id: 'supervised-vs-unsupervised',
        title: 'Supervised vs. Unsupervised Learning',
        category: 'Artificial Intelligence & Data Science',
        icon: GitFork,
        description: 'Classification and regression with labeled data vs. clustering and anomaly detection.'
      },
      {
        id: 'model-evaluation-overfitting',
        title: 'Model Evaluation & Overfitting',
        category: 'Artificial Intelligence & Data Science',
        icon: Target,
        description: 'Bias-variance tradeoff, cross-validation, precision/recall, F1 score, and regularization.'
      }
    ]
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    icon: Globe2,
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
      },
      {
        id: 'world-geography',
        title: 'World Geography & Plate Tectonics',
        category: 'General Knowledge',
        icon: Globe2,
        description: 'Continental drift, ocean currents, climate zones, and major global landmarks.'
      },
      {
        id: 'global-economics',
        title: 'Global Economics & Inflation',
        category: 'General Knowledge',
        icon: Coins,
        description: 'Supply and demand, central banks, interest rates, GDP, and purchasing power.'
      },
      {
        id: 'constitutional-governance',
        title: 'Constitutional Rights & Governance',
        category: 'General Knowledge',
        icon: Scale,
        description: 'Separation of powers, fundamental rights, democratic institutions, and rule of law.'
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
              <span className="pill-count">
                {TOPIC_CATEGORIES.reduce((sum, c) => sum + c.topics.length, 0)}
              </span>
            </button>
            {TOPIC_CATEGORIES.map(cat => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-pill ${activeCategoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                >
                  {CatIcon && <CatIcon size={15} />}
                  <span>{cat.name}</span>
                  <span className="pill-count">{cat.topics.length}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar */}
          <div className="topic-search-wrapper">
            <div className="topic-search-container">
              <Search size={18} className="topic-search-icon" />
              <input
                type="text"
                placeholder="Search topics (e.g. Calculus, Python, Photosynthesis, Machine Learning)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="topic-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="topic-search-clear"
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
            <div className="topic-empty-state">
              <BookOpen size={36} className="topic-empty-icon" />
              <h3>No topics found</h3>
              <p>
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
            filteredCategories.map(cat => {
              const CatIcon = cat.icon;
              return (
            <div key={cat.id} className="category-section">
              <div className="category-section-header">
                <span className={`category-tag-badge ${cat.badgeClass}`}>
                  {CatIcon && <CatIcon size={15} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />}
                  {cat.name.toUpperCase()}
                </span>
                <span className="category-topic-count">{cat.topics.length} Available Topics</span>
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
              );
            })
          )}
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

