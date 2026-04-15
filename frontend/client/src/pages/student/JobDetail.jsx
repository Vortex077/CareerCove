import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, MapPin, Briefcase, Calendar, Globe,
  Mail, Phone, CheckCircle, XCircle, Clock, ExternalLink,
  GraduationCap, BookOpen, Code2, Users, Target, FileText
} from 'lucide-react';
import api from '../../config/api';


const STATUS_META = {
  APPLIED:             { label: 'Applied',            color: '#3B82F6', bg: '#DBEAFE' },
  UNDER_REVIEW:        { label: 'Under Review',       color: '#D97706', bg: '#FEF3C7' },
  SHORTLISTED:         { label: 'Shortlisted',        color: '#7C3AED', bg: '#EDE9FE' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled',color: '#0891B2', bg: '#CFFAFE' },
  SELECTED:            { label: '🎉 Selected!',        color: '#059669', bg: '#D1FAE5' },
  REJECTED:            { label: 'Not Selected',       color: '#DC2626', bg: '#FEE2E2' },
};

export default function JobDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();


  const [job,       setJob]       = useState(null);
  const [myApp,     setMyApp]     = useState(null); // existing application if any
  const [loading,   setLoading]   = useState(true);
  const [applying,  setApplying]  = useState(false);
  const [toast,     setToast]     = useState(null); // { msg, ok }

  useEffect(() => {
    (async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data.data.job);

        // Check if student has already applied
        try {
          const appsRes = await api.get('/applications/my/all?limit=200');
          const existing = appsRes.data.data.applications.find(a => a.jobId === parseInt(id, 10));
          if (existing) setMyApp(existing);
        } catch { /* ignore */ }
      } catch {
        navigate('/student/jobs');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/applications/${id}`);
      setMyApp({ status: 'APPLIED', appliedAt: new Date().toISOString() });
      showToast('Application submitted successfully! 🎉', true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to apply. Please try again.', false);
    } finally {
      setApplying(false);
    }
  };

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  };

  const daysLeft = job ? Math.ceil((new Date(job.applicationDeadline) - new Date()) / 86400000) : 0;
  const deadlinePassed = daysLeft < 0;

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job)    return null;

  const sm = myApp ? (STATUS_META[myApp.status] || STATUS_META.APPLIED) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 999,
          background: toast.ok ? '#0F172A' : '#FEF2F2',
          color: toast.ok ? 'white' : '#DC2626',
          padding: '0.875rem 1.25rem', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontSize: '0.9rem', maxWidth: 380, fontWeight: 500,
          border: toast.ok ? 'none' : '1px solid #FECACA',
          animation: 'slideUp 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Hero ── */}
      <div className="page-hero" style={{ paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '0.5rem' }}>
          <button
            onClick={() => navigate('/student/jobs')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 14px', color: 'white', cursor: 'pointer', marginBottom: '1.125rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back to Jobs
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: 'white', flexShrink: 0 }}>
                  {job.company?.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>{job.company?.name}</p>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', margin: 0, lineHeight: 1.2 }}>{job.title}</h1>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {job.location    && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{job.location}</span>}
                {job.jobType     && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Briefcase size={14} />{job.jobType.replace('_', ' ')}</span>}
                {job.packageInfo && <span>💰 {job.packageInfo}</span>}
                {job.duration    && <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.duration}</span>}
              </div>
            </div>

            {/* Deadline pill */}
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '1rem 1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deadline</p>
              <p style={{ margin: '4px 0 2px', fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>{new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: deadlinePassed ? '#FCA5A5' : daysLeft <= 5 ? '#FCD34D' : '#6EE7B7' }}>
                {deadlinePassed ? 'Deadline Passed' : `${daysLeft} days left`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 5, paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Eligibility Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} style={{ color: '#0F766E' }} /> Eligibility Criteria
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <EligibilityItem
                  icon={<GraduationCap size={16} />}
                  label="Minimum CGPA"
                  value={job.minCgpa ? `${job.minCgpa} / 10` : 'No requirement'}
                  ok={job.minCgpa == null}
                />
                <EligibilityItem
                  icon={<BookOpen size={16} />}
                  label="Active Backlogs Allowed"
                  value={job.maxBacklogs != null ? (job.maxBacklogs === 0 ? 'None (clean record)' : `Up to ${job.maxBacklogs}`) : 'No restriction'}
                  ok={job.maxBacklogs === 0 || job.maxBacklogs == null}
                  warn={job.maxBacklogs > 0}
                />
                <EligibilityItem
                  icon={<Users size={16} />}
                  label="Batch Year"
                  value={job.allowedYears?.length > 0 ? job.allowedYears.join(', ') + ' Year' : 'All years'}
                  ok={true}
                />
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                    <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />Eligible Departments
                  </p>
                  {job.allowedDepartments?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {job.allowedDepartments.map(d => (
                        <span key={d} style={{ background: '#CCFBF1', color: '#0F766E', borderRadius: 20, padding: '3px 12px', fontSize: '0.8rem', fontWeight: 600 }}>{d}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>Open to all departments</span>
                  )}
                </div>
              </div>
            </div>

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Code2 size={18} style={{ color: '#0F766E' }} /> Required Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.requiredSkills.map(skill => (
                    <span key={skill} style={{ background: '#F1F5F9', color: '#334155', borderRadius: 8, padding: '5px 14px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #E2E8F0' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description */}
            {job.shortDescription && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: '#0F766E' }} /> About the Role
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.8, margin: 0, fontSize: '0.95rem' }}>
                  {job.shortDescription}
                </p>
              </div>
            )}

            {/* Drive Info */}
            {job.drive && (
              <div className="card" style={{ padding: '1.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <h2 style={{ fontSize: '1rem', margin: '0 0 0.625rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={16} /> Part of Placement Drive
                </h2>
                <p style={{ margin: 0, fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{job.drive.title}</p>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                  {new Date(job.drive.startDate).toLocaleDateString()} – {job.drive.endDate ? new Date(job.drive.endDate).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Apply / Status card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              {myApp ? (
                /* Already applied */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: sm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', fontSize: '1.4rem' }}>
                    {myApp.status === 'SELECTED' ? '🎉' : myApp.status === 'REJECTED' ? '😔' : '📋'}
                  </div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#0F172A' }}>Application Status</h3>
                  <span style={{ background: sm.bg, color: sm.color, borderRadius: 20, padding: '6px 18px', fontSize: '0.9rem', fontWeight: 700 }}>
                    {sm.label}
                  </span>
                  <p style={{ margin: '0.875rem 0 0', color: '#94A3B8', fontSize: '0.78rem' }}>
                    Applied on {new Date(myApp.appliedAt || myApp.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate('/student/applications')}
                    className="btn btn-outline"
                    style={{ marginTop: '1rem', width: '100%' }}>
                    View All Applications
                  </button>
                </div>
              ) : (
                /* Apply button */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Job Type</span>
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>{job.jobType?.replace('_', ' ')}</span>
                  </div>
                  {job.packageInfo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Package</span>
                      <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.875rem' }}>{job.packageInfo}</span>
                    </div>
                  )}
                  {job.location && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Location</span>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>{job.location}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                    {deadlinePassed ? (
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FEF2F2', borderRadius: 10, color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                        ⏰ Application deadline has passed
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700 }}
                        onClick={handleApply}
                        disabled={applying}
                      >
                        {applying ? 'Submitting…' : '🚀 Apply Now'}
                      </button>
                    )}
                    <p style={{ textAlign: 'center', margin: '0.625rem 0 0', color: '#94A3B8', fontSize: '0.75rem' }}>
                      Your profile & resume will be shared
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Company Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', margin: '0 0 1.125rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} style={{ color: '#0F766E' }} /> Company Details
              </h2>

              {/* Company avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.125rem', paddingBottom: '1.125rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: '#0F766E', flexShrink: 0 }}>
                  {job.company?.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>{job.company?.name}</p>
                  {job.company?.industry && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>{job.company.industry}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {job.company?.description && (
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem', lineHeight: 1.7 }}>
                    {job.company.description}
                  </p>
                )}

                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F766E', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                    <Globe size={15} /> Visit Company Website <ExternalLink size={12} />
                  </a>
                )}

                {/* HR Contact box */}
                {(job.company?.hrName || job.company?.hrEmail) && (
                  <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '0.875rem', border: '1px solid #E2E8F0', marginTop: '0.25rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HR Contact</p>
                    {job.company.hrName && (
                      <p style={{ margin: '0 0 0.35rem', fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
                        {job.company.hrName}
                      </p>
                    )}
                    {job.company.hrEmail && (
                      <a href={`mailto:${job.company.hrEmail}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F766E', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '0.25rem' }}>
                        <Mail size={13} /> {job.company.hrEmail}
                      </a>
                    )}
                    {job.company.hrPhone && (
                      <a href={`tel:${job.company.hrPhone}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F766E', fontSize: '0.82rem', textDecoration: 'none' }}>
                        <Phone size={13} /> {job.company.hrPhone}
                      </a>
                    )}
                  </div>
                )}

                {/* External career link */}
                {job.companyJobUrl && (
                  <a href={job.companyJobUrl} target="_blank" rel="noreferrer"
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    <ExternalLink size={14} /> View on Company Careers Page
                  </a>
                )}

                {/* JD PDF */}
                {job.jdPdfUrl && (
                  <a href={job.jdPdfUrl} target="_blank" rel="noreferrer"
                    className="btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                    <FileText size={14} /> Download Job Description (PDF)
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function EligibilityItem({ icon, label, value, ok, warn }) {
  const color = warn ? '#D97706' : ok ? '#059669' : '#DC2626';
  const bg    = warn ? '#FFFBEB' : ok ? '#F0FDF4' : '#FEF2F2';
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '0.875rem', border: `1px solid ${color}22` }}>
      <p style={{ margin: '0 0 0.35rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color }}>{icon}</span> {label}
      </p>
      <p style={{ margin: 0, fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>{value}</p>
    </div>
  );
}
