import { useEffect, useState } from 'react';
import { Upload, User, Save } from 'lucide-react';
import api from '../../config/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    phone: '',
    cgpa: '',
    activeBacklogs: '0',
    skills: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/students/profile');
        const s = data.data.student;
        setProfile({
          phone: s.phone || '',
          cgpa: s.cgpa || '',
          activeBacklogs: s.activeBacklogs?.toString() || '0',
          skills: s.skills ? s.skills.join(', ') : '',
          githubUrl: s.githubUrl || '',
          linkedinUrl: s.linkedinUrl || '',
          portfolioUrl: s.portfolioUrl || '',
          resumeUrl: s.resumeUrl || ''
        });
      } catch {
        setStatus({ type: 'error', message: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      // Clean and split skills
      const cleanedSkills = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      await api.put('/students/profile', {
        ...profile,
        cgpa: parseFloat(profile.cgpa),
        activeBacklogs: parseInt(profile.activeBacklogs, 10),
        skills: cleanedSkills
      });

      // Handle resume upload if attached
      if (selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        
        await api.post('/students/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Refresh to fetch resumeUrl
        const { data } = await api.get('/students/profile');
        setProfile(prev => ({ ...prev, resumeUrl: data.data.student.resumeUrl }));
        setSelectedFile(null); // Clear selection
      }

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="container mt-6 mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-lighter)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
          <User size={28} />
        </div>
        <div>
          <h1 className="text-primary mb-1">My Profile</h1>
          <p className="text-secondary text-sm">Manage your personal and academic details</p>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <form onSubmit={handleSubmit} className="card">
          
          {status.message && (
            <div className={`alert alert-${status.type}`}>
              {status.message}
            </div>
          )}

          <h3 className="mb-4 text-primary">Academic Information</h3>
          <div className="grid grid-cols-2 mb-6">
            <div className="form-group">
              <label className="form-label" htmlFor="cgpa">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                id="cgpa"
                name="cgpa"
                className="form-input"
                value={profile.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="activeBacklogs">Active Backlogs</label>
              <input
                type="number"
                min="0"
                id="activeBacklogs"
                name="activeBacklogs"
                className="form-input"
                value={profile.activeBacklogs}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3 className="mb-4 text-primary" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>Links & Contact</h3>
          <div className="grid grid-cols-2 mb-6">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="form-input"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit number"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="linkedinUrl">LinkedIn URL</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                className="form-input"
                value={profile.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="githubUrl">GitHub URL</label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                className="form-input"
                value={profile.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="portfolioUrl">Portfolio Website</label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                className="form-input"
                value={profile.portfolioUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="skills">Skills (Comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              className="form-input"
              value={profile.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python"
            />
          </div>

          <h3 className="mb-4 text-primary" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>Resume Upload</h3>
          <div className="form-group mb-6 p-4" style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: 'var(--color-bg-tertiary)' }}>
            <Upload size={32} className="text-secondary mx-auto mb-2" />
            <p className="text-sm text-secondary mb-2">Upload your latest PDF or DOCX resume (Max 5MB)</p>
            <input 
               type="file" 
               accept=".pdf,.doc,.docx"
               onChange={handleFileChange}
               style={{ display: 'block', margin: '0 auto' }}
               
            />
            {profile.resumeUrl && !selectedFile && (
               <p className="mt-4 text-sm text-success">
                 Current File: <a href={profile.resumeUrl} target="_blank" rel="noreferrer">View Uploaded Resume</a>
               </p>
            )}
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
            <p className="text-sm text-secondary">* Make sure your details match eligibility requirements before applying.</p>
            <button 
              type="submit" 
              className="btn btn-primary gap-2"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
