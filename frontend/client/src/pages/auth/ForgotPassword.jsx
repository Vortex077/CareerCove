import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus({ 
        type: 'success', 
        message: response.data.message || 'If an account exists, a reset link has been sent to your email.' 
      });
      setEmail('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to process request. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-secondary)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Enter your email to receive a reset link
          </p>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Registered Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@college.edu"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ 
          marginTop: 'var(--space-6)', 
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
        }}>
          <Link to="/login" style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
