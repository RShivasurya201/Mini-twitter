import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-3">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-3">Loading...</div>;
  }

  return !user ? children : <Navigate to="/feed" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/feed" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

