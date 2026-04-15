import { useEffect, useState } from 'react';
import { Briefcase, Clock, CheckCircle, ArrowRight, Building, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

export default function StudentDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [stats, setStats]   = useState({ total: 0, inReview: 0, shortlisted: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/applications/my/all?limit=5');
        const apps     = data.data.applications;
        setRecent(apps);

        const all = (await api.get('/applications/my/all?limit=500')).data.data.applications;
        setStats({
          total:      all.length,
          inReview:   all.filter(a => ['APPLIED','UNDER_REVIEW'].includes(a.status)).length,
          shortlisted:all.filter(a => ['SHORTLISTED','INTERVIEW_SCHEDULED','SELECTED'].includes(a.status)).length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const statusMeta = {
    APPLIED:             { label: 'Applied',    cls: 'badge-info'    },
    UNDER_REVIEW:        { label: 'In Review',  cls: 'badge-warning' },
    SHORTLISTED:         { label: 'Shortlisted',cls: 'badge-primary' },
    INTERVIEW_SCHEDULED: { label: 'Interview',  cls: 'badge-primary' },
    SELECTED:            { label: 'Selected',   cls: 'badge-success' },
    REJECTED:            { label: 'Rejected',   cls: 'badge-error'   },
    WITHDRAWN:           { label: 'Withdrawn',  cls: 'badge-error'   },
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="slide-up">

      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop: '0.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginBottom: '0.25rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            Student Portal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Hello, {firstName} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: 520 }}>
            Track your applications, discover new opportunities, and manage your placement journey.
          </p>
        </div>
      </div>

      {/* Stats — float over hero bottom */}
      <div className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 5, paddingBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { icon: <Briefcase size={24} />, value: stats.total,      label: 'Total Applied', color: '#0F766E' },
            { icon: <Clock     size={24} />, value: stats.inReview,   label: 'In Review',     color: '#D97706' },
            { icon: <CheckCircle size={24}/>, value: stats.shortlisted,label: 'Shortlisted',  color: '#059669' },
          ].map(s => (
            <div key={s.label} className="stat-card slide-up">
              <div style={{ width:48, height:48, borderRadius:'50%', background:`${s.color}18`, display:'flex',alignItems:'center',justifyContent:'center', margin:'0 auto 0.75rem', color:s.color }}>
                {s.icon}
              </div>
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Applications</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/applications')}>
            View all <ArrowRight size={14} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            <Briefcase size={40} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }} />
            <h3 style={{ color:'#94A3B8', marginBottom:'0.5rem', fontSize:'1.1rem' }}>No applications yet</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem', marginBottom:'1.5rem' }}>Browse open positions and apply to get started.</p>
            <button className="btn btn-primary" onClick={() => navigate('/student/jobs')}>
              Explore Jobs
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {recent.map(app => {
              const sm = statusMeta[app.status] || { label: app.status, cls: 'badge-info' };
              return (
                <div key={`${app.studentId}-${app.jobId}`} className="card" style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                  {/* Company Avatar */}
                  <div style={{ width:44, height:44, borderRadius:10, background:'#F1F5F9', display:'flex',alignItems:'center',justifyContent:'center', fontWeight:700, fontSize:'1.1rem', color:'#0F766E', flexShrink:0 }}>
                    {app.job.company.name.charAt(0)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, color:'#0F172A', margin:0, fontSize:'0.95rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {app.job.title}
                    </p>
                    <p style={{ color:'#64748B', fontSize:'0.82rem', margin:'2px 0 0', display:'flex', alignItems:'center', gap:6 }}>
                      <Building size={12} /> {app.job.company.name}
                      <span style={{ color:'#CBD5E1' }}>•</span>
                      <Calendar size={12} /> {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${sm.cls}`}>{sm.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
