import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Hash, Briefcase, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: 'STUDENT', enrollmentNumber: '', department: '',
    batchYear: new Date().getFullYear() + 4,
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      const res = await register(payload);
      setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isStudent = formData.role === 'STUDENT';

  return (
    <div className="auth-shell fade-in">

      {/* ── Brand / Left Pane ── */}
      <div className="auth-brand">
        <div className="auth-brand-decor"
          style={{ width: 380, height: 380, background: 'rgba(255,255,255,0.07)', top: '-100px', right: '-100px' }} />
        <div className="auth-brand-decor"
          style={{ width: 260, height: 260, background: 'rgba(20,184,166,0.2)',  bottom: '-60px', left: '-60px' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 420 }}>
          <div className="flex items-center gap-3 mb-10">
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={22} color="white" />
            </div>
            <span style={{ color: 'white', fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:700 }}>CareerCove</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Join your university's{' '}
            <span style={{ color: '#5EEAD4' }}>placement hub.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Create your profile, upload your resume, and let recruiters from 150+ top companies discover you automatically.
          </p>

          {/* Feature bullets */}
          {[
            'Auto-matched to eligible job postings',
            'Real-time application status tracking',
            'Secure document storage via Supabase',
          ].map(f => (
            <div key={f} className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#5EEAD4', fontWeight: 700, fontSize: '0.7rem' }}>✓</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.9rem' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form / Right Pane ── */}
      <div className="auth-form-side" style={{ background: '#F8FAFC', alignItems: 'flex-start', paddingTop: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 520 }} className="slide-up">

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              Create your account
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Access exclusive placement opportunities at your institute.
            </p>
          </div>

          {error   && <div className="alert alert-error   mb-4">{error}</div>}

          {success ? (
            <div className="alert alert-success" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{success}</p>
              <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Account Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="role">Account type</label>
                <select id="role" name="role" className="form-select" style={{ height: 46, background: '#fff' }}
                  value={formData.role} onChange={handleChange}>
                  <option value="STUDENT">Student Candidate</option>
                  <option value="TNP_COORDINATOR">T&P Coordinator</option>
                  <option value="HOD">Head of Department (HOD)</option>
                </select>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full name</label>
                <div className="input-icon-wrap">
                  <User size={16} />
                  <input id="fullName" name="fullName" type="text"
                    className="form-input" style={{ height: 46, background: '#fff' }}
                    placeholder="John Doe"
                    value={formData.fullName} onChange={handleChange} required />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">University email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} />
                  <input id="email" name="email" type="email"
                    className="form-input" style={{ height: 46, background: '#fff' }}
                    placeholder="john@university.edu"
                    value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              {/* Student-only fields */}
              {isStudent && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="enrollmentNumber">Enrollment number</label>
                    <div className="input-icon-wrap">
                      <Hash size={16} />
                      <input id="enrollmentNumber" name="enrollmentNumber" type="text"
                        className="form-input" style={{ height: 46, background: '#fff' }}
                        placeholder="0101XXXXXXXX"
                        value={formData.enrollmentNumber} onChange={handleChange} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="department">Department</label>
                      <div className="input-icon-wrap">
                        <Briefcase size={16} />
                        <select id="department" name="department"
                          className="form-select" style={{ height: 46, paddingLeft: 40, background: '#fff' }}
                          value={formData.department} onChange={handleChange} required>
                          <option value="">Select branch</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="batchYear">Batch year</label>
                      <div className="input-icon-wrap">
                        <GraduationCap size={16} />
                        <input id="batchYear" name="batchYear" type="number"
                          className="form-input" style={{ height: 46, background: '#fff' }}
                          min="2020" max="2035"
                          value={formData.batchYear} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Passwords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} />
                    <input id="password" name="password" type="password"
                      className="form-input" style={{ height: 46, background: '#fff' }}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      value={formData.password} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} />
                    <input id="confirmPassword" name="confirmPassword" type="password"
                      className="form-input" style={{ height: 46, background: '#fff' }}
                      placeholder="••••••••"
                      minLength={8}
                      value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-4"
                style={{ height: 50, fontSize: '1rem', fontWeight: 600, marginTop: '1.25rem' }}
                disabled={loading}
              >
                {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight size={17} /></>}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
