import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentList from './components/StudentList';
import Attendance from './components/Attendance';
import AdminLogin from './components/AdminLogin';
import Navbar from './components/Navbar';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Attendance />} />
            <Route 
              path="/students" 
              element={isAdmin ? <StudentList /> : <AdminLogin setIsAdmin={setIsAdmin} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;