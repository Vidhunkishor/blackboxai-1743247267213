import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute-v6';
import StudentList from './components/StudentList';
import Attendance from './components/Attendance';
import AdminLogin from './components/AdminLogin';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Attendance />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route 
                path="/students" 
                element={
                  <ProtectedRoute>
                    <StudentList />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;