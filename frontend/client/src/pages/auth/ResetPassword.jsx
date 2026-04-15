import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post(`/auth/reset-password/${token}`, { 
        password: formData.password 
      });
      
      setStatus({ 
        type: 'success', 
        message: 'Password has been successfully reset! You can now login.' 
      });
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Invalid or expired reset link. Please try again.';
      setStatus({ type: 'error', message: errorMsg });
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
            Create New Password
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Please enter your new password below.
          </p>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        {status.type !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            
            <div className="form-helper mb-4">
              Password must be at least 8 characters with 1 uppercase, 1 lowercase and 1 number.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {status.type === 'success' && (
          <button 
            className="btn btn-primary mt-4" 
            onClick={() => navigate('/login')}
            style={{ width: '100%' }}
          >
            Go to Login Now
          </button>
        )}
      </div>
    </div>
  );
}
