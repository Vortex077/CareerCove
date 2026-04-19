import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, ArrowRight, BookOpen, Users, TrendingUp } from 'lucide-react';

export default function Login() {
  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await login(formData.email, formData.password);
      const role = res.data.user.role;
      if (role === 'STUDENT')                                navigate('/student/dashboard');
      else if (role === 'ADMIN' || role === 'TNP_COORDINATOR') navigate('/admin/dashboard');
      else if (role === 'HOD')                               navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <Users size={20} />,     value: '1,200+', label: 'Students Placed'  },
    { icon: <TrendingUp size={20} />, value: '94%',    label: 'Placement Rate'  },
    { icon: <BookOpen size={20} />,  value: '50+',   label: 'Partner Companies' },
  ];

  return (
    <div className="auth-shell fade-in">

      {/* ── Brand / Left Pane ── */}
      <div className="auth-brand">
        {/* Decorative blobs */}
        <div className="auth-brand-decor"
          style={{ width: 420, height: 420, background: 'rgba(255,255,255,0.06)', top: '-120px', left: '-120px' }} />
        <div className="auth-brand-decor"
          style={{ width: 320, height: 320, background: 'rgba(20,184,166,0.18)', bottom: '-80px', right: '-80px' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 540 }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <BookOpen size={22} color="white" />
            </div>
            <span style={{ color: 'white', fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              CareerCove
            </span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Launch your<br />career journey.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '90%' }}>
            The unified placement platform trusted by universities. Connect with top companies, track your applications, and land your dream role.
          </p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {stats.map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '1.25rem 1rem',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
              }}>
                <div style={{ color: '#5EEAD4', marginBottom: 12 }}>{s.icon}</div>
                <div style={{ color: 'white', fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form / Right Pane ── */}
      <div className="auth-form-side">
        <div className="auth-form-box slide-up delay-100">

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.375rem' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Sign in to access your placement portal
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="input-icon-wrap">
                <Mail size={17} />
                <input
                  id="email" name="email" type="email"
                  className="form-input" style={{ height: 48, background: '#F8FAFC' }}
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label m-0" htmlFor="password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-icon-wrap">
                <Lock size={17} />
                <input
                  id="password" name="password" type="password"
                  className="form-input" style={{ height: 48, background: '#F8FAFC' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ height: 48, fontSize: '0.9375rem', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.75rem 0' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
