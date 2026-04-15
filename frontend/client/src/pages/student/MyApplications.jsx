import { useEffect, useState } from 'react';
import { Briefcase, Building, Calendar, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import api from '../../config/api';

const STATUS_META = {
  APPLIED:             { label: 'Applied',              color: '#3B82F6', bg: '#DBEAFE', step: 1 },
  UNDER_REVIEW:        { label: 'Under Review',         color: '#D97706', bg: '#FEF3C7', step: 2 },
  SHORTLISTED:         { label: 'Shortlisted',          color: '#7C3AED', bg: '#EDE9FE', step: 3 },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled',  color: '#0891B2', bg: '#CFFAFE', step: 4 },
  SELECTED:            { label: '🎉 Selected!',         color: '#059669', bg: '#D1FAE5', step: 5 },
  REJECTED:            { label: 'Not Selected',         color: '#DC2626', bg: '#FEE2E2', step: 0 },
  WITHDRAWN:           { label: 'Withdrawn',            color: '#64748B', bg: '#F1F5F9', step: 0 },
};

const PIPELINE = ['APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','SELECTED'];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/applications/my/all?limit=100');
        setApplications(data.data.applications);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filters = ['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'];
  const visible = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  const stats = {
    total:      applications.length,
    active:     applications.filter(a => !['REJECTED','WITHDRAWN','SELECTED'].includes(a.status)).length,
    selected:   applications.filter(a => a.status === 'SELECTED').length,
    rejected:   applications.filter(a => a.status === 'REJECTED').length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div className="slide-up">
      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop:'0.5rem' }}>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>My Career</p>
          <h1 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', marginBottom:'0.5rem' }}>My Applications</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem' }}>Track the status of every job and internship you've applied for.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop:'-2rem', position:'relative', zIndex:5, paddingBottom:'3rem' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { n: stats.total,    l: 'Total', c: '#0F766E' },
            { n: stats.active,   l: 'In Progress', c: '#D97706' },
            { n: stats.selected, l: 'Selected', c: '#059669' },
            { n: stats.rejected, l: 'Rejected', c: '#DC2626' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-number" style={{ color: s.c }}>{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'5px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:600,
                border:'1.5px solid',
                borderColor:  filter === f ? '#0F766E' : '#E2E8F0',
                background:   filter === f ? '#0F766E' : 'white',
                color:        filter === f ? 'white'   : '#64748B',
                cursor:'pointer', transition:'all 0.15s'
              }}>
              {f === 'ALL' ? 'All' : STATUS_META[f]?.label || f}
              {f !== 'ALL' && <span style={{ marginLeft:6, opacity:0.8 }}>({applications.filter(a => a.status === f).length})</span>}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3.5rem' }}>
            <Briefcase size={44} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }}/>
            <h3 style={{ color:'#94A3B8', marginBottom:'0.5rem' }}>No applications yet</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Browse the Job Board to find and apply to eligible positions.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {visible.map(app => {
              const sm = STATUS_META[app.status] || STATUS_META.APPLIED;
              const isActive = !['REJECTED','WITHDRAWN'].includes(app.status);
              const pipelineStep = PIPELINE.indexOf(app.status);

              return (
                <div key={`${app.studentId}-${app.jobId}`} className="card" style={{ padding:'1.5rem', borderLeft:`4px solid ${sm.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'1rem' }}>
                    {/* Header */}
                    <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0F766E', fontSize:'1.1rem', flexShrink:0 }}>
                        {app.job?.company?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin:0, fontSize:'1.05rem', color:'#0F172A', marginBottom:2 }}>{app.job?.title}</h3>
                        <p style={{ margin:0, color:'#64748B', fontSize:'0.82rem', display:'flex', gap:8 }}>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Building size={12}/>{app.job?.company?.name}</span>
                          {app.job?.location && <span>📍 {app.job.location}</span>}
                          {app.job?.packageInfo && <span>💰 {app.job.packageInfo}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <span style={{ background:sm.bg, color:sm.color, padding:'5px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:700 }}>
                        {sm.label}
                      </span>
                      <p style={{ margin:'4px 0 0', fontSize:'0.75rem', color:'#94A3B8' }}>
                        Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Pipeline tracker — only for active, non-rejected */}
                  {isActive && (
                    <div style={{ marginTop:'0.75rem', paddingTop:'0.875rem', borderTop:'1px solid #F1F5F9' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                        {PIPELINE.map((stage, idx) => {
                          const stg = STATUS_META[stage];
                          const done    = pipelineStep >= idx;
                          const current = pipelineStep === idx;
                          return (
                            <div key={stage} style={{ flex:1, display:'flex', alignItems:'center' }}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                                <div style={{
                                  width: current ? 28 : 22, height: current ? 28 : 22,
                                  borderRadius:'50%',
                                  background: done ? sm.color : '#E2E8F0',
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  color:'white', fontSize:'0.7rem', fontWeight:700,
                                  boxShadow: current ? `0 0 0 3px ${sm.color}30` : 'none',
                                  transition:'all 0.2s'
                                }}>
                                  {done ? '✓' : idx + 1}
                                </div>
                                <span style={{ fontSize:'0.65rem', color: done ? sm.color : '#94A3B8', marginTop:4, textAlign:'center', fontWeight: current ? 700 : 400 }}>
                                  {stg.label.replace(' Scheduled','')}
                                </span>
                              </div>
                              {idx < PIPELINE.length - 1 && (
                                <div style={{ height:2, flex:0.5, background: pipelineStep > idx ? sm.color : '#E2E8F0', margin:'0 -1px', marginBottom:20 }}/>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {app.adminRemarks && (
                    <div style={{ marginTop:'0.75rem', background:'#F8FAFC', borderRadius:8, padding:'0.625rem 0.875rem', fontSize:'0.85rem', color:'#475569', display:'flex', gap:8 }}>
                      <AlertCircle size={16} style={{ color:'#64748B', flexShrink:0, marginTop:1 }}/>
                      <span><strong>Note from T&P:</strong> {app.adminRemarks}</span>
                    </div>
                  )}

                  {/* Resume link */}
                  {app.resumeUrl && (
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:'0.75rem', color:'#0F766E', fontSize:'0.82rem', fontWeight:500 }}>
                      <FileText size={14}/> View Submitted Resume <ExternalLink size={12}/>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
