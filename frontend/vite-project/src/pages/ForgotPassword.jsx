import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axiosCalls/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    setLoading(true);
    try {
      const response = await api.post('/customers/forgot-password', { email });
      setStatus({ type: 'success', text: response.data?.message || 'Check your email for a reset link.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Forgot Password</h2>
        <p className="text-sm text-slate-600 mb-6 text-center">
          Enter your email and we'll send you a link to reset your password.
        </p>
        {status.text && (
          <div className={`mb-4 text-sm p-3 rounded border ${
            status.type === 'success'
              ? 'text-green-700 bg-green-100 border-green-300'
              : 'text-red-600 bg-red-100 border-red-300'
          }`}>
            {status.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="john@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
