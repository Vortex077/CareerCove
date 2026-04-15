import { useEffect, useState } from 'react';
import { Search, Building, MapPin, Calendar, ChevronRight, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

export default function JobList() {
  const navigate   = useNavigate();
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [applying, setApplying] = useState(null);
  const [toast,    setToast]    = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const url = search ? `/jobs?search=${encodeURIComponent(search)}` : '/jobs';
        const { data } = await api.get(url);
        setJobs(data.data.jobs);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    const t = setTimeout(fetch, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.post(`/applications/${jobId}`);
      setToast('Application submitted! You can track it on your dashboard.');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to apply.');
      setTimeout(() => setToast(''), 4000);
    } finally {
      setApplying(null);
    }
  };

  const typeColor = { FULL_TIME:'badge-primary', INTERNSHIP:'badge-warning', BOTH:'badge-success' };

  return (
    <div className="slide-up">

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, background:'#0F172A', color:'white', padding:'0.875rem 1.25rem', borderRadius:10, fontSize:'0.9rem', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', maxWidth:380 }}>
          {toast}
        </div>
      )}

      {/* Hero with search */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop:'0.5rem' }}>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>
            Career Opportunities
          </p>
          <h1 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', marginBottom:'0.5rem' }}>Find Your Next Role</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1rem', maxWidth:500, marginBottom:'1.5rem' }}>
            Browse exclusive placements and internships posted by your university's placement cell.
          </p>

          {/* Search bar */}
          <div style={{ position:'relative', maxWidth:520 }}>
            <Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft:44, height:50, fontSize:'1rem', borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,0.12)', border:'none' }}
              placeholder="Search by role, company, or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop:'-0.5rem', position:'relative', zIndex:5, paddingBottom:'3rem' }}>
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3.5rem' }}>
            <Briefcase size={44} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }} />
            <h3 style={{ color:'#94A3B8', marginBottom:'0.5rem' }}>No jobs found</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>
              {search ? 'Try a different keyword.' : 'No openings posted yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.75rem' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3
                      onClick={() => navigate(`/student/jobs/${job.id}`)}
                      style={{ fontSize:'1.1rem', margin:'0 0 0.35rem', color:'#0F172A', lineHeight:1.3, cursor:'pointer', transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='#0F766E'}
                      onMouseLeave={e => e.currentTarget.style.color='#0F172A'}
                    >
                      {job.title}
                    </h3>
                    <p style={{ margin:0, fontSize:'0.875rem', color:'#64748B', display:'flex', alignItems:'center', gap:6 }}>
                      <Building size={13} /> {job.company.name}
                      {job.location && <><span style={{ color:'#CBD5E1' }}>·</span><MapPin size={13} />{job.location}</>}
                    </p>
                  </div>
                  <span className={`badge ${typeColor[job.jobType] || 'badge-primary'}`} style={{ flexShrink:0 }}>
                    {job.jobType.replace('_',' ')}
                  </span>
                </div>

                {/* Description */}
                {job.shortDescription && (
                  <p style={{ fontSize:'0.875rem', color:'#475569', margin:0, lineHeight:1.6,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {job.shortDescription}
                  </p>
                )}

                {/* Meta chips */}
                <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
                  {job.packageInfo && (
                    <span style={{ background:'#F0FDF4', color:'#166534', borderRadius:6, padding:'3px 10px', fontSize:'0.78rem', fontWeight:600 }}>
                      💰 {job.packageInfo}
                    </span>
                  )}
                  {job.minCgpa && (
                    <span style={{ background:'#FFF7ED', color:'#9A3412', borderRadius:6, padding:'3px 10px', fontSize:'0.78rem', fontWeight:600 }}>
                      📊 ≥ {job.minCgpa} CGPA
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #F1F5F9', paddingTop:'0.875rem', marginTop:'auto', gap:'0.5rem' }}>
                  <span style={{ fontSize:'0.8rem', color:'#94A3B8', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                    <Calendar size={13} />
                    Closes: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/student/jobs/${job.id}`)}
                    >
                      Details
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ gap:4 }}
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                    >
                      {applying === job.id ? 'Applying…' : <><span>Apply</span><ChevronRight size={14} /></>}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
