import { useEffect, useState, useCallback } from 'react';
import {
  Briefcase, Plus, Building, Calendar, Users, Eye, Pencil,
  Trash2, X, ChevronDown, CheckCircle2, XCircle, Clock, ArrowRight
} from 'lucide-react';
import api from '../../config/api';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering'];
const STATUS_META = {
  APPLIED:             { label: 'Applied',     color: '#3B82F6', bg: '#DBEAFE' },
  UNDER_REVIEW:        { label: 'Under Review',color: '#D97706', bg: '#FEF3C7' },
  SHORTLISTED:         { label: 'Shortlisted', color: '#7C3AED', bg: '#EDE9FE' },
  INTERVIEW_SCHEDULED: { label: 'Interview',   color: '#0891B2', bg: '#CFFAFE' },
  SELECTED:            { label: 'Selected',    color: '#059669', bg: '#D1FAE5' },
  REJECTED:            { label: 'Rejected',    color: '#DC2626', bg: '#FEE2E2' },
  WITHDRAWN:           { label: 'Withdrawn',   color: '#64748B', bg: '#F1F5F9' },
};

const EMPTY_FORM = {
  title: '', companyId: '', driveId: '', jobType: 'FULL_TIME', location: '',
  packageInfo: '', minCgpa: '', maxBacklogs: '0', applicationDeadline: '',
  shortDescription: '', status: 'published',
  allowedDepartments: [], allowedYears: [], requiredSkills: '', duration: ''
};

export default function ManageJobs() {
  const [jobs,      setJobs]      = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives,    setDrives]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Modal state
  const [modal,   setModal]   = useState(null); // 'create' | 'edit' | 'applicants'
  const [selJob,  setSelJob]  = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);

  // Applicants panel
  const [applicants, setApplicants] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsR, compR, drivR] = await Promise.all([
        api.get('/jobs/admin?limit=50'),
        api.get('/companies?limit=100'),
        api.get('/drives?limit=100'),
      ]);
      setJobs(jobsR.data.data.jobs);
      setCompanies(compR.data.data.companies);
      setDrives(drivR.data.data.drives);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };

  const openEdit = (job) => {
    setSelJob(job);
    setForm({
      title: job.title || '',
      companyId: job.companyId || '',
      driveId: job.driveId || '',
      jobType: job.jobType || 'FULL_TIME',
      location: job.location || '',
      packageInfo: job.packageInfo || '',
      minCgpa: job.minCgpa || '',
      maxBacklogs: job.maxBacklogs ?? 0,
      applicationDeadline: job.applicationDeadline
        ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
        : '',
      shortDescription: job.shortDescription || '',
      allowedDepartments: job.allowedDepartments || [],
      allowedYears: (job.allowedYears || []).map(y => 
        y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : y === 4 ? '4th Year' : `${y}th Year`
      ),
      requiredSkills: (job.requiredSkills || []).join(', '),
      duration: job.duration || '',
    });
    setError('');
    setModal('edit');
  };

  const openApplicants = async (job) => {
    setSelJob(job);
    setModal('applicants');
    setAppLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${job.id}?limit=100`);
      setApplicants(data.data.applications);
    } catch (e) { console.error(e); }
    finally { setAppLoading(false); }
  };

  const closeModal = () => { setModal(null); setSelJob(null); setError(''); };

  const handleDeptToggle = (dept) => {
    setForm(f => ({
      ...f,
      allowedDepartments: f.allowedDepartments.includes(dept)
        ? f.allowedDepartments.filter(d => d !== dept)
        : [...f.allowedDepartments, dept]
    }));
  };
  const handleYearToggle = (yr) => {
    setForm(f => ({
      ...f,
      allowedYears: f.allowedYears.includes(yr)
        ? f.allowedYears.filter(y => y !== yr)
        : [...f.allowedYears, yr]
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = {
      ...form,
      requiredSkills: form.requiredSkills ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      if (modal === 'create') await api.post('/jobs', payload);
      else                    await api.put(`/jobs/${selJob.id}`, payload);
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? All applications will also be removed.`)) return;
    try {
      await api.delete(`/jobs/${job.id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  // ── Status Update ──────────────────────────────────────────────────────────
  const handleStatusChange = async (app, newStatus) => {
    setStatusUpdating(`${app.studentId}-${app.jobId}`);
    try {
      await api.patch(`/applications/${app.studentId}/${app.jobId}/status`, { status: newStatus });
      setApplicants(prev =>
        prev.map(a => a.studentId === app.studentId && a.jobId === app.jobId
          ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed');
    } finally {
      setStatusUpdating(null);
    }
  };

  // ── Eligibility check helper ───────────────────────────────────────────────
  const getEligibility = (app, job) => {
    if (!app.student || !job) return { eligible: true, reasons: [] };
    const reasons = [];
    if (job.minCgpa && parseFloat(app.student.cgpa) < parseFloat(job.minCgpa))
      reasons.push(`CGPA ${app.student.cgpa} < required ${job.minCgpa}`);
    if (job.maxBacklogs != null && app.student.activeBacklogs > job.maxBacklogs)
      reasons.push(`${app.student.activeBacklogs} active backlogs > max ${job.maxBacklogs}`);
    if (job.allowedYears?.length > 0 && !job.allowedYears.includes(app.student.currentYear))
      reasons.push(`Batch Year ${app.student.currentYear} not eligible`);
    
    if (job.requiredSkills?.length > 0) {
      const studentSkills = (app.student.skills || []).map(s => s.toLowerCase());
      const missing = job.requiredSkills.filter(req => !studentSkills.includes(req.toLowerCase()));
      if (missing.length > 0) {
        reasons.push(`Missing skills: ${missing.join(', ')}`);
      }
    }
    
    return { eligible: reasons.length === 0, reasons };
  };

  // ── Job Form Modal ─────────────────────────────────────────────────────────
  const JobFormModal = () => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="card" style={{ width:'100%', maxWidth:760, maxHeight:'92vh', overflowY:'auto', padding:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #E2E8F0' }}>
          <h2 style={{ margin:0, fontSize:'1.4rem' }}>{modal === 'create' ? 'Post New Job' : 'Edit Job'}</h2>
          <button onClick={closeModal} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B', padding:4 }}><X size={20}/></button>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group m-0">
              <label className="form-label">Job Title *</label>
              <input className="form-input" required placeholder="e.g. Software Engineer"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Company *</label>
              <select className="form-select" required value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})}>
                <option value="">Select company…</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group m-0">
              <label className="form-label">Job Type *</label>
              <select className="form-select" value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="BOTH">Full Time + PPO</option>
              </select>
            </div>
            <div className="form-group m-0">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="e.g. Bengaluru"
                value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Package / Stipend</label>
              <input className="form-input" placeholder="e.g. 8 LPA"
                value={form.packageInfo} onChange={e => setForm({...form, packageInfo: e.target.value})} />
            </div>
          </div>

          {/* Row 3 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group m-0">
              <label className="form-label">Min CGPA</label>
              <input className="form-input" type="number" step="0.1" min="0" max="10" placeholder="6.5"
                value={form.minCgpa} onChange={e => setForm({...form, minCgpa: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Max Backlogs</label>
              <input className="form-input" type="number" min="0" placeholder="0"
                value={form.maxBacklogs} onChange={e => setForm({...form, maxBacklogs: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Duration (Internship)</label>
              <input className="form-input" placeholder="e.g. 6 months"
                value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group m-0">
              <label className="form-label">Application Deadline *</label>
              <input className="form-input" type="datetime-local" required
                value={form.applicationDeadline} onChange={e => setForm({...form, applicationDeadline: e.target.value})} />
            </div>
            <div className="form-group m-0">
              <label className="form-label">Link to Drive (optional)</label>
              <select className="form-select" value={form.driveId} onChange={e => setForm({...form, driveId: e.target.value})}>
                <option value="">No drive selected</option>
                {drives.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          </div>

          {/* Eligibility Years */}
          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label className="form-label">Allowed Year (Batch Eligibility)</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.35rem' }}>
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => (
                <button type="button" key={yr} onClick={() => handleYearToggle(yr)}
                  style={{
                    padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:500, cursor:'pointer',
                    border:`1.5px solid ${form.allowedYears.includes(yr) ? '#0F766E' : '#E2E8F0'}`,
                    background: form.allowedYears.includes(yr) ? '#CCFBF1' : 'white',
                    color: form.allowedYears.includes(yr) ? '#0F766E' : '#64748B',
                    transition: 'all 0.15s'
                  }}>
                  {yr}
                </button>
              ))}
            </div>
            <p style={{ margin:'4px 0 0', fontSize:'0.75rem', color:'#94A3B8' }}>Select which academic years are eligible to apply for this job.</p>
          </div>

          {/* Departments */}
          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label className="form-label">Allowed Departments</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.35rem' }}>
              {DEPARTMENTS.map(dept => (
                <button type="button" key={dept} onClick={() => handleDeptToggle(dept)}
                  style={{
                    padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:500, cursor:'pointer',
                    border:`1.5px solid ${form.allowedDepartments.includes(dept) ? '#0F766E' : '#E2E8F0'}`,
                    background: form.allowedDepartments.includes(dept) ? '#CCFBF1' : 'white',
                    color: form.allowedDepartments.includes(dept) ? '#0F766E' : '#64748B',
                    transition: 'all 0.15s'
                  }}>
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label className="form-label">Required Skills (comma-separated)</label>
            <input className="form-input" placeholder="e.g. React, Node.js, SQL, Python"
              value={form.requiredSkills} onChange={e => setForm({...form, requiredSkills: e.target.value})} />
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom:'1.5rem' }}>
            <label className="form-label">Short Description *</label>
            <textarea className="form-textarea" rows={3} required
              placeholder="Brief summary shown to students on the job board…"
              value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
          </div>

          <div style={{ display:'flex', gap:'0.75rem', paddingTop:'1rem', borderTop:'1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>
              {saving ? 'Saving…' : modal === 'create' ? 'Publish Job' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Applicants Modal ───────────────────────────────────────────────────────
  const ApplicantsModal = () => {
    const eligible   = applicants.filter(a => getEligibility(a, selJob).eligible);
    const ineligible = applicants.filter(a => !getEligibility(a, selJob).eligible);

    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
        <div className="card" style={{ width:'100%', maxWidth:900, maxHeight:'92vh', overflowY:'auto', padding:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #E2E8F0' }}>
            <div>
              <h2 style={{ margin:0, fontSize:'1.3rem' }}>{selJob?.title}</h2>
              <p style={{ margin:'4px 0 0', color:'#64748B', fontSize:'0.875rem' }}>
                {selJob?.company?.name} · {applicants.length} total applicants
                <span style={{ marginLeft:12, color:'#059669', fontWeight:600 }}>✓ {eligible.length} eligible</span>
                {ineligible.length > 0 && <span style={{ marginLeft:8, color:'#DC2626', fontWeight:600 }}>✗ {ineligible.length} ineligible</span>}
              </p>
            </div>
            <button onClick={closeModal} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B' }}><X size={20}/></button>
          </div>

          {appLoading ? (
            <div className="loading-screen" style={{ minHeight:200 }}><div className="spinner"/></div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#94A3B8' }}>
              <Users size={40} style={{ margin:'0 auto 1rem', opacity:0.4 }}/>
              <p>No applications yet.</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ background:'#F8FAFC', borderBottom:'2px solid #E2E8F0' }}>
                    <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Student</th>
                    <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Dept</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>CGPA</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Backlogs</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Eligible?</th>
                    <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Status</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', fontWeight:600, color:'#64748B', fontSize:'0.75rem', textTransform:'uppercase' }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => {
                    const { eligible: isEl, reasons } = getEligibility(app, selJob);
                    const sm = STATUS_META[app.status] || STATUS_META.APPLIED;
                    const isUpdating = statusUpdating === `${app.studentId}-${app.jobId}`;
                    return (
                      <tr key={`${app.studentId}-${app.jobId}`} style={{ borderBottom:'1px solid #F1F5F9' }}>
                        <td style={{ padding:'10px 12px' }}>
                          <p style={{ margin:0, fontWeight:600, color:'#0F172A' }}>{app.student?.user?.fullName || '—'}</p>
                          <p style={{ margin:0, color:'#64748B', fontSize:'0.78rem' }}>{app.student?.user?.email}</p>
                        </td>
                        <td style={{ padding:'10px 12px', color:'#475569', fontSize:'0.82rem' }}>{app.student?.department}</td>
                        <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, color: Number(app.student?.cgpa) >= (selJob?.minCgpa || 0) ? '#059669' : '#DC2626' }}>
                          {app.student?.cgpa || '—'}
                        </td>
                        <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:600, color: app.student?.activeBacklogs > (selJob?.maxBacklogs ?? 99) ? '#DC2626' : '#0F172A' }}>
                          {app.student?.activeBacklogs ?? 0}
                        </td>
                        <td style={{ padding:'10px 12px', textAlign:'center' }}>
                          {isEl ? (
                            <span title="Eligible" style={{ color:'#059669' }}><CheckCircle2 size={18}/></span>
                          ) : (
                            <span title={reasons.join('; ')} style={{ color:'#DC2626', cursor:'help' }}><XCircle size={18}/></span>
                          )}
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ background:sm.bg, color:sm.color, padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:600 }}>
                            {sm.label}
                          </span>
                        </td>
                        <td style={{ padding:'10px 12px', textAlign:'center' }}>
                          <select
                            value={app.status}
                            disabled={isUpdating}
                            onChange={e => handleStatusChange(app, e.target.value)}
                            style={{ fontSize:'0.8rem', border:'1px solid #E2E8F0', borderRadius:6, padding:'4px 8px', cursor:'pointer', background:'white' }}
                          >
                            <option value="APPLIED">Applied</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                            <option value="SELECTED">Selected ✓</option>
                            <option value="REJECTED">Rejected ✗</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="slide-up">
      {modal === 'create' || modal === 'edit' ? <JobFormModal /> : null}
      {modal === 'applicants' ? <ApplicantsModal /> : null}

      {/* Hero */}
      <div className="page-hero">
        <div className="container" style={{ paddingTop:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>Placement Control</p>
            <h1 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', marginBottom:'0.25rem' }}>Manage Jobs</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem', marginBottom:0 }}>Post, edit, and track job listings and applicant pipelines.</p>
          </div>
          <button className="btn" onClick={openCreate}
            style={{ background:'white', color:'#0F766E', fontWeight:700, padding:'0.75rem 1.5rem', fontSize:'0.95rem', boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}>
            <Plus size={18}/> Post New Job
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop:'-1rem', position:'relative', zIndex:5, paddingBottom:'3rem' }}>
        {loading ? (
          <div className="loading-screen"><div className="spinner"/></div>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            <Briefcase size={44} style={{ color:'#CBD5E1', margin:'0 auto 1rem' }}/>
            <h3 style={{ color:'#94A3B8' }}>No jobs posted yet</h3>
            <p style={{ color:'#94A3B8', fontSize:'0.9rem', marginBottom:'1.5rem' }}>Click "Post New Job" to get started.</p>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Post New Job</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {jobs.map(job => {
              const appCount = job._count?.applications ?? job.applicationCount ?? 0;
              const statusClr = job.status === 'published' ? '#059669' : job.status === 'draft' ? '#D97706' : '#DC2626';
              const statusBg  = job.status === 'published' ? '#D1FAE5' : job.status === 'draft' ? '#FEF3C7' : '#FEE2E2';
              return (
                <div key={job.id} className="card" style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderLeft:`4px solid ${statusClr}` }}>
                  {/* Company circle */}
                  <div style={{ width:48, height:48, borderRadius:10, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0F766E', fontSize:'1.2rem', flexShrink:0 }}>
                    {job.company?.name?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', flexWrap:'wrap', marginBottom:'0.25rem' }}>
                      <h3 style={{ margin:0, fontSize:'1.05rem', color:'#0F172A' }}>{job.title}</h3>
                      <span style={{ background:statusBg, color:statusClr, borderRadius:20, padding:'2px 10px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase' }}>
                        {job.status}
                      </span>
                      <span style={{ background:'#EDE9FE', color:'#7C3AED', borderRadius:20, padding:'2px 10px', fontSize:'0.7rem', fontWeight:600 }}>
                        {job.jobType.replace('_',' ')}
                      </span>
                    </div>
                    <p style={{ margin:0, color:'#64748B', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Building size={12}/> {job.company?.name}</span>
                      {job.location && <span>📍 {job.location}</span>}
                      {job.packageInfo && <span>💰 {job.packageInfo}</span>}
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={12}/> Closes: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Applicants count */}
                  <button onClick={() => openApplicants(job)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'#F1F5F9', border:'none', borderRadius:10, padding:'0.625rem 1rem', cursor:'pointer', minWidth:70 }}>
                    <span style={{ fontSize:'1.5rem', fontWeight:800, color:'#0F766E', lineHeight:1 }}>{appCount}</span>
                    <span style={{ fontSize:'0.7rem', color:'#64748B' }}>Applicants</span>
                  </button>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                    <button onClick={() => openApplicants(job)} className="btn btn-outline btn-sm" title="View applicants">
                      <Eye size={15}/>
                    </button>
                    <button onClick={() => openEdit(job)} className="btn btn-outline btn-sm" title="Edit job"
                      style={{ borderColor:'#7C3AED', color:'#7C3AED' }}>
                      <Pencil size={15}/>
                    </button>
                    <button onClick={() => handleDelete(job)} className="btn btn-sm" title="Delete job"
                      style={{ borderColor:'#DC2626', color:'#DC2626', background:'transparent', border:'1.5px solid #DC2626' }}>
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
