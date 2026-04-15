import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight, XCircle, CheckCircle2, Building, MapPin, Package } from 'lucide-react';
import api from '../../config/api';

const STAGES = [
  { key:'APPLIED',             label:'Applied',      color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE' },
  { key:'UNDER_REVIEW',        label:'Under Review', color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
  { key:'SHORTLISTED',         label:'Shortlisted',  color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE' },
  { key:'INTERVIEW_SCHEDULED', label:'Interview',    color:'#0891B2', bg:'#ECFEFF', border:'#A5F3FC' },
  { key:'SELECTED',            label:'Selected',     color:'#059669', bg:'#F0FDF4', border:'#BBF7D0' },
];

function getNextStage(key) {
  const idx = STAGES.findIndex(s => s.key === key);
  return idx !== -1 && idx < STAGES.length - 1 ? STAGES[idx + 1].key : null;
}

export default function JobApplications() {
  const { jobId }  = useParams();
  const navigate  = useNavigate();

  const [job,      setJob]      = useState(null);
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [shifting, setShifting] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}?limit=300`),
      ]);
      setJob(jobRes.data.data.job);
      setApps(appsRes.data.data.applications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleShift = async (app, newStatus) => {
    const key = `${app.studentId}-${app.jobId}`;
    setShifting(key);
    // Optimistic update
    setApps(prev => prev.map(a =>
      a.studentId === app.studentId && a.jobId === app.jobId ? { ...a, status: newStatus } : a
    ));
    try {
      await api.patch(`/applications/${app.studentId}/${app.jobId}/status`, { status: newStatus });
    } catch (e) {
      alert(e.response?.data?.error || 'Update failed');
      fetchData(); // revert
    } finally {
      setShifting(null);
    }
  };

  // Eligibility check
  const getEligibility = (app) => {
    const reasons = [];
    if (job?.minCgpa && parseFloat(app.student?.cgpa) < parseFloat(job.minCgpa))
      reasons.push(`CGPA ${app.student.cgpa} < ${job.minCgpa}`);
    if (job?.maxBacklogs != null && (app.student?.activeBacklogs ?? 0) > job.maxBacklogs)
      reasons.push(`${app.student.activeBacklogs} backlogs > ${job.maxBacklogs}`);
    return { eligible: reasons.length === 0, reasons };
  };

  const active   = apps.filter(a => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN');
  const rejected = apps.filter(a => a.status === 'REJECTED');

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div style={{ minHeight:'100vh', background:'#F1F5F9' }}>

      {/* Hero */}
      <div className="page-hero" style={{ paddingBottom:'3rem' }}>
        <div className="container" style={{ paddingTop:'0.5rem' }}>
          {/* Back button */}
          <button
            onClick={() => navigate('/admin/applications')}
            style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:20, padding:'4px 12px', color:'white', cursor:'pointer', marginBottom:'1rem', fontSize:'0.8rem', fontWeight:600 }}
          >
            <ArrowLeft size={14}/> Back to Pipeline
          </button>

          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
            {job?.company?.name}
          </p>
          <h1 style={{ fontSize:'clamp(1.5rem,3.5vw,2.1rem)', marginBottom:'0.5rem' }}>
            {job?.title}
          </h1>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', color:'rgba(255,255,255,0.8)', fontSize:'0.85rem' }}>
            {job?.location     && <span style={{ display:'flex', alignItems:'center', gap:5 }}><MapPin size={14}/>{job.location}</span>}
            {job?.packageInfo  && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Package size={14}/>{job.packageInfo}</span>}
            {job?.minCgpa      && <span>📊 Min CGPA: {job.minCgpa}</span>}
            {job?.maxBacklogs != null && <span>📋 Max Backlogs: {job.maxBacklogs}</span>}
            <span style={{ display:'flex', alignItems:'center', gap:5 }}><Building size={14}/>{job?.company?.name}</span>
          </div>

          {/* Stage totals */}
          <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap', marginTop:'1.25rem' }}>
            {STAGES.map(s => {
              const n = apps.filter(a => a.status === s.key).length;
              return (
                <div key={s.key} style={{ background:'rgba(255,255,255,0.18)', borderRadius:20, padding:'4px 14px', fontSize:'0.78rem', fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, display:'inline-block' }}/>
                  {s.label} <span style={{ opacity:0.8 }}>({n})</span>
                </div>
              );
            })}
            {rejected.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.18)', borderRadius:20, padding:'4px 14px', fontSize:'0.78rem', fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#EF4444', display:'inline-block' }}/>
                Rejected <span style={{ opacity:0.8 }}>({rejected.length})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      <div style={{ overflowX:'auto', padding:'1.25rem 1.5rem 3rem' }}>
        {apps.length === 0 ? (
          <div style={{ maxWidth:480, margin:'3rem auto', background:'white', borderRadius:14, padding:'3rem', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
            <FileText size={40} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }}/>
            <h3 style={{ color:'#94A3B8', margin:'0 0 0.5rem' }}>No applications yet</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem', margin:0 }}>Students haven't applied to this position yet.</p>
          </div>
        ) : (
          <div style={{ display:'flex', gap:'1rem', minWidth:`${(STAGES.length + (rejected.length > 0 ? 1 : 0)) * 290}px`, alignItems:'flex-start' }}>

            {STAGES.map(stage => {
              const stageApps = active.filter(a => a.status === stage.key);
              const nextStage = getNextStage(stage.key);

              return (
                <div key={stage.key} style={{ flex:'0 0 272px', display:'flex', flexDirection:'column', gap:'0.625rem' }}>

                  {/* Column header */}
                  <div style={{ background:'white', borderRadius:10, padding:'0.75rem 1rem', borderTop:`3px solid ${stage.color}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.875rem', fontWeight:700, color:stage.color }}>{stage.label}</span>
                    <span style={{ background:stage.bg, color:stage.color, padding:'2px 10px', borderRadius:20, fontSize:'0.78rem', fontWeight:800, border:`1px solid ${stage.border}` }}>
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  {stageApps.map(app => {
                    const key  = `${app.studentId}-${app.jobId}`;
                    const busy = shifting === key;
                    const { eligible, reasons } = getEligibility(app);

                    return (
                      <div key={key} style={{ background:'white', borderRadius:10, padding:'0.875rem', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:`1px solid ${stage.border}`, opacity: busy ? 0.6 : 1, transition:'all 0.2s' }}>

                        {/* Header row */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:`${stage.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', color:stage.color, flexShrink:0 }}>
                              {app.student?.user?.fullName?.charAt(0)}
                            </div>
                            <div>
                              <p style={{ margin:0, fontWeight:700, fontSize:'0.875rem', color:'#0F172A', lineHeight:1.2 }}>
                                {app.student?.user?.fullName}
                              </p>
                              <p style={{ margin:0, fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>
                                {app.student?.department?.replace(' Engineering',' Engg.')}
                              </p>
                            </div>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                            {app.resumeUrl && (
                              <a href={app.resumeUrl} target="_blank" rel="noreferrer" title="View Resume" style={{ color:'#3B82F6' }}>
                                <FileText size={14}/>
                              </a>
                            )}
                            <span title={eligible ? 'Eligible' : reasons.join('; ')} style={{ fontSize:'0.65rem', fontWeight:700, background: eligible ? '#F0FDF4' : '#FEF2F2', color: eligible ? '#059669' : '#DC2626', padding:'2px 7px', borderRadius:5, cursor: eligible ? 'default' : 'help', whiteSpace:'nowrap' }}>
                              {eligible ? '✓ Eligible' : '✗ Ineligible'}
                            </span>
                          </div>
                        </div>

                        {/* CGPA & Backlogs */}
                        <div style={{ display:'flex', gap:'0.375rem', marginBottom:'0.625rem', flexWrap:'wrap' }}>
                          {app.student?.cgpa != null && (
                            <span style={{ fontSize:'0.68rem', fontWeight:700, background: parseFloat(app.student.cgpa) >= (job?.minCgpa||0) ? '#F0FDF4' : '#FEF2F2', color: parseFloat(app.student.cgpa) >= (job?.minCgpa||0) ? '#166534' : '#DC2626', padding:'2px 7px', borderRadius:5 }}>
                              📊 CGPA {app.student.cgpa}
                            </span>
                          )}
                          {app.student?.activeBacklogs != null && (
                            <span style={{ fontSize:'0.68rem', fontWeight:700, background: app.student.activeBacklogs > 0 ? '#FEF2F2' : '#F0FDF4', color: app.student.activeBacklogs > 0 ? '#DC2626' : '#166534', padding:'2px 7px', borderRadius:5 }}>
                              {app.student.activeBacklogs === 0 ? '✓ No backlogs' : `⚠ ${app.student.activeBacklogs} backlog`}
                            </span>
                          )}
                        </div>

                        {/* Applied date */}
                        <p style={{ margin:'0 0 0.625rem', fontSize:'0.68rem', color:'#94A3B8' }}>
                          Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </p>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button
                            onClick={() => handleShift(app, 'REJECTED')}
                            disabled={busy}
                            title="Reject"
                            style={{ width:32, height:32, borderRadius:7, border:'1.5px solid #FECACA', background:'#FEF2F2', color:'#DC2626', cursor: busy ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}
                          >
                            <XCircle size={15}/>
                          </button>

                          {nextStage ? (
                            <button
                              onClick={() => handleShift(app, nextStage)}
                              disabled={busy}
                              style={{ flex:1, height:32, borderRadius:7, background:`linear-gradient(135deg,${stage.color},${stage.color}BB)`, color:'white', border:'none', cursor: busy ? 'wait' : 'pointer', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:4, boxShadow:`0 2px 8px ${stage.color}40`, transition:'all 0.15s' }}
                            >
                              {busy ? '…' : <>{STAGES.find(s => s.key === nextStage)?.label} <ChevronRight size={13}/></>}
                            </button>
                          ) : (
                            <div style={{ flex:1, height:32, borderRadius:7, background:'#F0FDF4', border:'1.5px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:'0.75rem', fontWeight:700, color:'#059669' }}>
                              <CheckCircle2 size={14}/> Selected ✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div style={{ border:'1.5px dashed #CBD5E1', borderRadius:10, padding:'1.5rem', textAlign:'center', color:'#94A3B8', fontSize:'0.8rem', background:'rgba(248,250,252,0.5)' }}>
                      No candidates
                    </div>
                  )}
                </div>
              );
            })}

            {/* Rejected column */}
            {rejected.length > 0 && (
              <div style={{ flex:'0 0 250px', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                <div style={{ background:'white', borderRadius:10, padding:'0.75rem 1rem', borderTop:'3px solid #DC2626', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#DC2626' }}>Rejected</span>
                  <span style={{ background:'#FEE2E2', color:'#DC2626', padding:'2px 10px', borderRadius:20, fontSize:'0.78rem', fontWeight:800 }}>{rejected.length}</span>
                </div>
                {rejected.map(app => (
                  <div key={`${app.studentId}-${app.jobId}`} style={{ background:'white', borderRadius:10, padding:'0.75rem', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #FEE2E2', opacity:0.8 }}>
                    <p style={{ margin:'0 0 2px', fontWeight:700, fontSize:'0.82rem', color:'#374151' }}>{app.student?.user?.fullName}</p>
                    <p style={{ margin:'0 0 0.5rem', fontSize:'0.7rem', color:'#94A3B8' }}>{app.student?.department}</p>
                    <button
                      onClick={() => handleShift(app, 'UNDER_REVIEW')}
                      style={{ width:'100%', padding:'5px 8px', borderRadius:7, border:'1px solid #E2E8F0', background:'#F8FAFC', cursor:'pointer', fontSize:'0.72rem', fontWeight:700, color:'#D97706' }}
                    >
                      ↩ Move to Review
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
