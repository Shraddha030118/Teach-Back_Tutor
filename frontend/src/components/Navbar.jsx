import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import teachBackTutorLogo from '../assets/teach-back-tutor-logo.png';
import ThemeToggle from './ThemeToggle';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const scrollToSection = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

  return (
    <header className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Logo / Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu} aria-label="Teach-Back Tutor Home">
          <img 
            src={teachBackTutorLogo} 
            alt="Teach-Back Tutor Logo" 
            className="nav-logo-img" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links-desktop">
          <Link 
            to="/" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'hero')}
          >
            Home
          </Link>
          <a 
            href="#how-it-works" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            How It Works
          </a>
          <a 
            href="#about" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'about')}
          >
            About
          </a>
          <Link 
            to="/history" 
            className="nav-link"
            onClick={closeMenu}
          >
            History
          </Link>
        </nav>

        {/* Auth & CTA Buttons */}
        <div className="nav-actions-desktop">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="nav-user-profile">
              <div className="nav-user-chip" title={user?.email}>
                <div className="nav-user-avatar">{userInitial}</div>
                <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
              </div>
              <button
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Log out of your account"
                aria-label="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-auth-login">
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="nav-auth-register">
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <Link 
            to="/topics" 
            className="btn btn-primary nav-btn"
            onClick={closeMenu}
          >
            <span>Start Learning</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {isAuthenticated && (
            <div className="mobile-user-card">
              <div className="nav-user-avatar">{userInitial}</div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">{user?.name}</span>
                <span className="mobile-user-email">{user?.email}</span>
              </div>
            </div>
          )}

          <Link 
            to="/" 
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'hero')}
          >
            Home
          </Link>
          <a 
            href="#how-it-works" 
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            How It Works
          </a>
          <a 
            href="#about" 
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'about')}
          >
            About
          </a>
          <Link 
            to="/history" 
            className="mobile-link"
            onClick={closeMenu}
          >
            History
          </Link>

          {!isAuthenticated ? (
            <div className="mobile-auth-links">
              <Link to="/login" className="mobile-auth-btn mobile-login-btn" onClick={closeMenu}>
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="mobile-auth-btn mobile-register-btn" onClick={closeMenu}>
                <UserPlus size={16} />
                <span>Create Account</span>
              </Link>
            </div>
          ) : (
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          )}

          <div className="mobile-theme-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Theme Appearance</span>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="mobile-cta-wrapper">
            <Link 
              to="/topics" 
              className="btn btn-primary btn-block"
              onClick={closeMenu}
            >
              <span>Start Learning</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
