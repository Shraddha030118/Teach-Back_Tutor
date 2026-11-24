import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/CustomCursor';
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
          <Route path="/topics" element={<TopicSelection />} />
          <Route path="/select-topic" element={<TopicSelection />} />
          <Route path="/session" element={<Session />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/chat" element={<Session />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/history" element={<History />} />
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
