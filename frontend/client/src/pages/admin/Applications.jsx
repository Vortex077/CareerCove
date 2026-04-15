import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Building, Calendar, ChevronRight, Users, CheckCircle, Clock, Briefcase } from 'lucide-react';
import api from '../../config/api';

const STATUS_COLORS = {
  APPLIED:             '#3B82F6',
  UNDER_REVIEW:        '#D97706',
  SHORTLISTED:         '#7C3AED',
  INTERVIEW_SCHEDULED: '#0891B2',
  SELECTED:            '#059669',
  REJECTED:            '#DC2626',
};

export default function ApplicationPipeline() {
  const navigate = useNavigate();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      // Fetch all admin jobs (includes application count)
      const { data } = await api.get('/jobs/admin?limit=100');
      const rawJobs  = data.data.jobs;

      // For each job, also fetch a status breakdown via applications endpoint
      const enriched = await Promise.all(
        rawJobs.map(async (job) => {
          try {
            const appsRes = await api.get(`/applications/job/${job.id}?limit=200`);
            const apps    = appsRes.data.data.applications;
            const breakdown = {};
            apps.forEach(a => {
              breakdown[a.status] = (breakdown[a.status] || 0) + 1;
            });
            return { ...job, apps, breakdown, totalApplicants: apps.length };
          } catch {
            return { ...job, apps: [], breakdown: {}, totalApplicants: job._count?.applications ?? 0 };
          }
        })
      );

      setJobs(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const activeJobs   = jobs.filter(j => j.status === 'published');
  const closedJobs   = jobs.filter(j => j.status !== 'published');
  const totalApps    = jobs.reduce((s, j) => s + (j.totalApplicants || 0), 0);
  const totalPlaced  = jobs.reduce((s, j) => s + (j.breakdown?.SELECTED || 0), 0);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color: '#64748B', marginTop:'1rem' }}>Loading pipeline…</p>
    </div>
  );

  return (
    <div className="slide-up">

      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop:'0.5rem' }}>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
            Placement Operations
          </p>
          <h1 style={{ fontSize:'clamp(1.5rem,3.5vw,2.2rem)', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:10 }}>
            <Target size={26}/> Application Pipeline
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.9rem', margin:0 }}>
            Click any job to view and manage its applicants stage-by-stage.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:'1.5rem', paddingBottom:'3rem' }}>

        {/* Summary row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { icon:<Briefcase size={20}/>, value: activeJobs.length, label:'Active Jobs',  color:'#0F766E' },
            { icon:<Users     size={20}/>, value: totalApps,          label:'Total Applied',color:'#7C3AED' },
            { icon:<CheckCircle size={20}/>,value: totalPlaced,       label:'Selected',    color:'#059669' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:'1rem', textAlign:'left', padding:'1.125rem 1.25rem' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div className="stat-number" style={{ color:s.color, fontSize:'1.75rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active jobs */}
        {activeJobs.length > 0 && (
          <>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#0F172A', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#059669', display:'inline-block' }}/>
              Active Jobs ({activeJobs.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem', marginBottom:'2.5rem' }}>
              {activeJobs.map(job => <JobCard key={job.id} job={job} navigate={navigate}/>)}
            </div>
          </>
        )}

        {/* Closed / draft jobs */}
        {closedJobs.length > 0 && (
          <>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#64748B', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#CBD5E1', display:'inline-block' }}/>
              Closed / Draft ({closedJobs.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {closedJobs.map(job => <JobCard key={job.id} job={job} navigate={navigate} muted/>)}
            </div>
          </>
        )}

        {jobs.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3.5rem' }}>
            <Target size={44} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }}/>
            <h3 style={{ color:'#94A3B8' }}>No jobs in the system yet</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Post a job from the Jobs tab and applicants will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, navigate, muted }) {
  const bd = job.breakdown || {};
  const stages = [
    { key:'APPLIED',             label:'Applied',   color:'#3B82F6' },
    { key:'UNDER_REVIEW',        label:'Review',    color:'#D97706' },
    { key:'SHORTLISTED',         label:'Shortlisted',color:'#7C3AED' },
    { key:'INTERVIEW_SCHEDULED', label:'Interview', color:'#0891B2' },
    { key:'SELECTED',            label:'Selected',  color:'#059669' },
  ];

  const total    = job.totalApplicants || 0;
  const selected = bd.SELECTED || 0;
  const rejected = bd.REJECTED || 0;

  return (
    <div
      onClick={() => navigate(`/admin/applications/${job.id}`)}
      className="card"
      style={{
        padding:'1.25rem 1.5rem',
        cursor:'pointer',
        opacity: muted ? 0.72 : 1,
        display:'flex',
        alignItems:'center',
        gap:'1.25rem',
        borderLeft:`4px solid ${muted ? '#CBD5E1' : '#0F766E'}`,
        transition:'all 0.18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(15,118,110,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Company avatar */}
      <div style={{ width:48, height:48, borderRadius:12, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.25rem', color:'#0F766E', flexShrink:0 }}>
        {job.company?.name?.charAt(0)}
      </div>

      {/* Job info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.3rem' }}>
          <h3 style={{ margin:0, fontSize:'1.05rem', color:'#0F172A', fontWeight:700 }}>{job.title}</h3>
          <span style={{ background: muted ? '#F1F5F9' : '#CCFBF1', color: muted ? '#94A3B8' : '#0F766E', borderRadius:20, padding:'2px 10px', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase' }}>
            {job.status}
          </span>
          <span style={{ background:'#EDE9FE', color:'#7C3AED', borderRadius:20, padding:'2px 10px', fontSize:'0.68rem', fontWeight:700 }}>
            {job.jobType?.replace('_',' ')}
          </span>
        </div>
        <p style={{ margin:0, color:'#64748B', fontSize:'0.82rem', display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Building size={12}/>{job.company?.name}</span>
          {job.location && <span>📍 {job.location}</span>}
          {job.packageInfo && <span>💰 {job.packageInfo}</span>}
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={12}/>Closes: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
        </p>
      </div>

      {/* Stage mini-bar */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', flexShrink:0, minWidth:220 }}>
        <div style={{ display:'flex', gap:'0.3rem', alignItems:'center' }}>
          {stages.map(s => {
            const n = bd[s.key] || 0;
            return (
              <div key={s.key} title={`${s.label}: ${n}`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 }}>
                <span style={{ fontSize:'0.75rem', fontWeight:800, color: n > 0 ? s.color : '#CBD5E1' }}>{n}</span>
                <div style={{ height:6, width:'100%', borderRadius:3, background: n > 0 ? s.color : '#E2E8F0' }}/>
                <span style={{ fontSize:'0.58rem', color:'#94A3B8', textAlign:'center', lineHeight:1.1 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', gap:'0.5rem', fontSize:'0.72rem', color:'#64748B' }}>
          <span><strong style={{ color:'#0F172A' }}>{total}</strong> total</span>
          {selected > 0 && <span>· <strong style={{ color:'#059669' }}>{selected}</strong> selected</span>}
          {rejected > 0 && <span>· <strong style={{ color:'#DC2626' }}>{rejected}</strong> rejected</span>}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={20} style={{ color:'#CBD5E1', flexShrink:0 }}/>
    </div>
  );
}
