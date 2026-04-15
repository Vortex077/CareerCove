import { useEffect, useState } from 'react';
import { Users, Briefcase, Building2, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import api from '../../config/api';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading || !stats) return <div className="loading-screen"><div className="spinner" /></div>;

  const metricCards = [
    { icon: <Users      size={22}/>, value: stats.stats.totalStudents,   label: 'Students',       color: '#7C3AED' },
    { icon: <Building2  size={22}/>, value: stats.stats.totalCompanies,  label: 'Companies',      color: '#0F766E' },
    { icon: <Briefcase  size={22}/>, value: stats.stats.totalJobs,       label: 'Active Jobs',    color: '#D97706' },
    { icon: <TrendingUp size={22}/>, value: `${stats.stats.placementRate}%`, label: 'Placed',     color: '#059669' },
  ];

  return (
    <div className="slide-up">

      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop: '0.5rem' }}>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>
            Administration
          </p>
          <h1 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', marginBottom:'0.5rem' }}>Control Panel</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1rem', maxWidth:520 }}>
            Real-time overview of your placement operations — students, companies, and drives at a glance.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop:'-2.5rem', position:'relative', zIndex:5, paddingBottom:'3rem' }}>

        {/* Metric cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', marginBottom:'2.5rem' }}>
          {metricCards.map(m => (
            <div key={m.label} className="stat-card slide-up">
              <div style={{ width:48,height:48,borderRadius:'50%',background:`${m.color}18`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem',color:m.color }}>
                {m.icon}
              </div>
              <div className="stat-number" style={{ color:m.color }}>{m.value}</div>
              <div className="stat-label">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Two-column feed */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>

          {/* Recent Applications */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:'1rem', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Clock size={16} style={{ color:'#0F766E' }} /> Recent Applications
              </h3>
            </div>
            {stats.recentApplications.length === 0 ? (
              <p style={{ padding:'2rem', textAlign:'center', color:'#94A3B8', fontSize:'0.9rem' }}>No recent activity</p>
            ) : (
              stats.recentApplications.map((app, i) => (
                <div key={i} style={{ padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', gap:'0.875rem', borderBottom:'1px solid #F8FAFC' }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#0F766E',flexShrink:0 }}>
                    {app.student.user.fullName.charAt(0)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, margin:0, fontSize:'0.875rem', color:'#0F172A' }}>{app.student.user.fullName}</p>
                    <p style={{ color:'#64748B', fontSize:'0.78rem', margin:'2px 0 0' }}>Applied → {app.job.title}</p>
                  </div>
                  <span className="badge badge-info" style={{ fontSize:'0.65rem' }}>New</span>
                </div>
              ))
            )}
          </div>

          {/* Recent Jobs */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:'1rem', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Briefcase size={16} style={{ color:'#0F766E' }} /> Latest Job Posts
              </h3>
            </div>
            {stats.recentJobs.length === 0 ? (
              <p style={{ padding:'2rem', textAlign:'center', color:'#94A3B8', fontSize:'0.9rem' }}>No jobs posted yet</p>
            ) : (
              stats.recentJobs.map(job => (
                <div key={job.id} style={{ padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', gap:'0.875rem', borderBottom:'1px solid #F8FAFC' }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',color:'#0F766E',flexShrink:0 }}>
                    {job.company.name.charAt(0)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, margin:0, fontSize:'0.875rem', color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{job.title}</p>
                    <p style={{ color:'#64748B', fontSize:'0.78rem', margin:'2px 0 0' }}>{job.company.name}</p>
                  </div>
                  <span className={`badge ${job.jobType === 'FULL_TIME' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize:'0.65rem', whiteSpace:'nowrap' }}>
                    {job.jobType.replace('_',' ')}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
