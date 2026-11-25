import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target to redirect after successful login
  const from = location.state?.from || '/topics';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Unable to log in. Please check your credentials.';
      if (!err.response) {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        msg = isLocal
          ? 'Unable to connect to the backend server. Please make sure the FastAPI backend is running on port 8000.'
          : 'Unable to connect to the backend API. Please make sure your backend is deployed and VITE_API_URL is configured in your deployment settings.';
      } else if (err.response.status === 401) {
        msg = err.response.data?.message || err.response.data?.detail || 'Invalid email or password. Please try again.';
      } else {
        msg = err.response.data?.message || err.response.data?.detail || 'Login failed. Please check your credentials and try again.';
      }
      setErrorMessage(typeof msg === 'string' ? msg : 'Unable to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={14} />
            <span>Teach-Back Tutor</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to track your teaching sessions and mastery scores.</p>
        </div>

        {location.state?.from && (
          <div style={{
            background: 'rgba(91, 77, 245, 0.08)',
            border: '1px solid rgba(91, 77, 245, 0.22)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            color: 'var(--brand-purple)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>Please log in to access your learning sessions.</span>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-right-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account yet?</span>
          <Link to="/register" state={{ from }} className="auth-switch-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
