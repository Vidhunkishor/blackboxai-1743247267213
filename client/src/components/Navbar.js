import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold flex items-center space-x-2 hover:text-blue-200 transition-colors"
          >
            <FaUserGraduate className="text-blue-300" />
            <span>Attendance Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
            >
              <FaChalkboardTeacher />
              <span>Attendance</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/students" 
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                >
                  <FaUserGraduate />
                  <span>Students</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <FaUserShield />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaChalkboardTeacher />
              <span>Attendance</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/students" 
                  className="block px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserGraduate />
                  <span>Students</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <FaUserShield />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;