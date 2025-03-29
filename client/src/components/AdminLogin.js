import React, { useState } from 'react';
import axios from 'axios';
import { FaFingerprint, FaUser, FaLock, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AdminLogin = ({ setIsAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('fingerprint');

  const validateInputs = () => {
    if (!username.trim()) {
      setMessage({ text: 'Username is required', type: 'error' });
      return false;
    }
    if (activeTab === 'password' && !password.trim()) {
      setMessage({ text: 'Password is required', type: 'error' });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:5000/admin/register', { username });
      const credential = await navigator.credentials.create({
        publicKey: response.data.publicKeyCredentialCreationOptions
      });

      await axios.post('http://localhost:5000/admin/register/complete', {
        username,
        credential
      });

      setMessage({ 
        text: 'Registration successful! You can now login with your fingerprint.', 
        type: 'success' 
      });
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintLogin = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:5000/admin/login', { username });
      const credential = await navigator.credentials.get({
        publicKey: response.data.publicKeyCredentialRequestOptions
      });

      const verifyResponse = await axios.post('http://localhost:5000/admin/login/verify', {
        username,
        credential
      });

      if (verifyResponse.data.success) {
        setIsAdmin(true);
      } else {
        setMessage({ text: 'Authentication failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:5000/admin/login/password', {
        username,
        password
      });

      if (response.data.success) {
        setIsAdmin(true);
      } else {
        setMessage({ text: 'Invalid credentials', type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FaUser className="mr-2" />
          Admin Portal
        </h2>
      </div>

      <div className="p-6">
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'fingerprint' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('fingerprint')}
          >
            <FaFingerprint className="inline mr-2" />
            Fingerprint
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock className="inline mr-2" />
            Password
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {activeTab === 'password' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.type === 'error' ? (
              <FaExclamationTriangle className="inline mr-2" />
            ) : (
              <FaCheckCircle className="inline mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="flex flex-col space-y-3">
          {activeTab === 'fingerprint' ? (
            <>
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaFingerprint className="mr-2" />
                )}
                Register Fingerprint
              </button>
              <button
                onClick={handleFingerprintLogin}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaFingerprint className="mr-2" />
                )}
                Login with Fingerprint
              </button>
            </>
          ) : (
            <button
              onClick={handlePasswordLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaLock className="mr-2" />
              )}
              Login with Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;