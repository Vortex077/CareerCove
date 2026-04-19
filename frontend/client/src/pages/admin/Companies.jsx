import { useEffect, useState } from 'react';
import { Building2, Plus, Globe } from 'lucide-react';
import api from '../../config/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', industry: '', website: '', description: ''
  });
  const [logoFile, setLogoFile] = useState(null);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data.data.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
      if (logoFile) {
        formPayload.append('logo', logoFile);
      }

      await api.post('/companies', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setFormData({ name: '', industry: '', website: '', description: '' });
      setLogoFile(null);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create company');
    }
  };

  return (
    <div className="container mt-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-primary mb-1 flex items-center gap-2"><Building2 size={24}/> Managed Companies</h1>
          <p className="text-secondary text-sm">Directory of companies available for job postings.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Company
        </button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="mb-4 text-primary">Add New Company</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="form-input" required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Information Technology" />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input type="url" className="form-input" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://" />
              </div>
              <div className="form-group">
                <label className="form-label">Company Logo</label>
                <input type="file" accept="image/*" className="form-input" onChange={e => setLogoFile(e.target.files?.[0])} />
                <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Optional. JPG, PNG formats supported.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="spinner mx-auto mt-12"></div> : (
        <div className="grid grid-cols-3 gap-6">
          {companies.map(c => (
            <div key={c.id} className="card flex flex-col justify-between">
               <div>
                  {c.logoUrl ? (
                    <img src={c.logoUrl} style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: 'var(--space-3)' }} alt={c.name} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Building2 size={24} className="text-secondary" />
                    </div>
                  )}
                  <h3 className="mb-1 text-primary-dark">{c.name}</h3>
                  <p className="text-sm text-secondary mb-3">{c.industry}</p>
                  <p className="text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
               </div>
               
               {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary font-medium mt-auto" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)'}}>
                    <Globe size={16} /> Visit Website
                  </a>
               )}
            </div>
          ))}
          {companies.length === 0 && <p className="text-secondary col-span-3">No companies registered.</p>}
        </div>
      )}
    </div>
  );
}
