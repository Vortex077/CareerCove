import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification link is invalid or has expired.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-secondary)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        
        {status === 'verifying' && (
          <div>
            <div className="spinner" style={{ margin: '0 auto var(--space-4) auto' }}></div>
            <h2 style={{ color: 'var(--color-text-primary)' }}>Verifying your email...</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ 
              width: '60px', height: '60px', 
              borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4) auto',
              color: 'var(--color-success)', fontSize: '30px'
            }}>
              ✓
            </div>
            <h2 style={{ color: 'var(--color-success)' }}>Verification Complete</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ 
              width: '60px', height: '60px', 
              borderRadius: '50%', backgroundColor: 'var(--color-error-bg)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4) auto',
              color: 'var(--color-error)', fontSize: '30px'
            }}>
              ✕
            </div>
            <h2 style={{ color: 'var(--color-error)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              {message}
            </p>
            <Link to="/register" className="btn btn-outline" style={{ width: '100%' }}>
              Back to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
