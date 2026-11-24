import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/CustomCursor';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TopicSelection from './pages/TopicSelection';
import Session from './pages/Session';
import Report from './pages/Report';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const location = useLocation();
  const isClassroom = location.pathname.startsWith('/session') || location.pathname === '/chat';

  return (
    <div className={`app-container ${isClassroom ? 'classroom-mode' : ''}`}>
      <CustomCursor />
      {!isClassroom && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/topics" 
            element={<ProtectedRoute><TopicSelection /></ProtectedRoute>} 
          />
          <Route 
            path="/select-topic" 
            element={<ProtectedRoute><TopicSelection /></ProtectedRoute>} 
          />
          <Route 
            path="/session" 
            element={<ProtectedRoute><Session /></ProtectedRoute>} 
          />
          <Route 
            path="/session/:id" 
            element={<ProtectedRoute><Session /></ProtectedRoute>} 
          />
          <Route 
            path="/chat" 
            element={<ProtectedRoute><Session /></ProtectedRoute>} 
          />
          <Route 
            path="/report" 
            element={<ProtectedRoute><Report /></ProtectedRoute>} 
          />
          <Route 
            path="/report/:id" 
            element={<ProtectedRoute><Report /></ProtectedRoute>} 
          />
          <Route 
            path="/history" 
            element={<ProtectedRoute><History /></ProtectedRoute>} 
          />
        </Routes>
      </main>
      {!isClassroom && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
