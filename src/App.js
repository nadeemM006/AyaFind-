import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import AyaDashboard from './pages/AyaDashboard';
import AyaCareRequests from './pages/AyaCareRequests';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/aya-dashboard" element={<AyaDashboard />} />
        <Route path="/aya-dashboard/care-requests" element={<AyaCareRequests />} />
      </Routes>
    </Router>
  );
}

export default App;