import { useEffect, useState } from 'react';
import { Target, Users, Calendar, Plus, ExternalLink } from 'lucide-react';
import api from '../../config/api';

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', driveType: 'FULL_TIME', 
    academicYear: '2025-2026', startDate: '', endDate: ''
  });

  const fetchDrives = async () => {
    try {
      const { data } = await api.get('/drives?limit=50');
      setDrives(data.data.drives);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrives(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drives', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', driveType: 'FULL_TIME', academicYear: '2025-2026', startDate: '', endDate: ''});
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initialize Drive');
    }
  };

  return (
    <div className="slide-up">
      <div style={{ background: 'linear-gradient(to right, var(--color-primary-dark), var(--color-primary-darker))', padding: 'var(--space-10) 0', paddingBottom: 'calc(var(--space-10) + 40px)', color: 'white' }}>
         <div className="container flex justify-between items-center">
            <div>
               <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: 'var(--space-2)' }} className="flex items-center gap-3">
                  <Target size={36}/> Event Drives
               </h1>
               <p style={{ opacity: 0.9, fontSize: '1.2rem', maxWidth: '600px' }}>
                  Group placement broadcasts into structured drives linking mass-applications cleanly.
               </p>
            </div>
            <button className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-primary-dark)', fontWeight: 'bold' }} onClick={() => setShowModal(true)}>
              + Initialize Drive
            </button>
         </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
         {showModal && (
           <div className="fade-in" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="card" style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-8)' }}>
               <h2 className="mb-6 text-primary-dark border-b pb-4">Architect New Drive</h2>
               <form onSubmit={handleSubmit}>
                 <div className="form-group mb-4">
                     <label className="form-label font-medium">Drive Title</label>
                     <input className="form-input bg-bg-secondary" required placeholder="e.g. Meta Core Engineering Pool" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="form-group">
                       <label className="form-label font-medium">Drive Output Variant</label>
                       <select className="form-select bg-bg-secondary" value={formData.driveType} onChange={e => setFormData({...formData, driveType: e.target.value})}>
                         <option value="FULL_TIME">FTE Rollout</option>
                         <option value="INTERNSHIP">Internship</option>
                         <option value="BOTH">Pre-Placement Protocol</option>
                       </select>
                     </div>
                     <div className="form-group">
                       <label className="form-label font-medium">Target Academic Phase</label>
                       <input className="form-input bg-bg-secondary" required placeholder="e.g. 2025-2026" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="form-group">
                       <label className="form-label font-medium">Start Limit</label>
                       <input type="date" className="form-input bg-bg-secondary" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                     </div>
                     <div className="form-group">
                       <label className="form-label font-medium">End Constraint (Optional)</label>
                       <input type="date" className="form-input bg-bg-secondary" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                     </div>
                 </div>
                 <div className="form-group mb-8">
                     <label className="form-label font-medium">Abstract Summary</label>
                     <textarea className="form-textarea bg-bg-secondary" rows="2" placeholder="Private internal note regarding this cluster..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                 </div>
                 <div className="flex gap-4 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
                   <button type="button" className="btn btn-outline flex-1" onClick={() => setShowModal(false)}>Cancel Processing</button>
                   <button type="submit" className="btn btn-primary flex-1">Initialize Segment</button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {loading ? (
            <div className="spinner mx-auto mt-12"></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
               {drives.length === 0 ? (
                  <div className="card text-center slide-up md:col-span-2" style={{ padding: 'var(--space-12)' }}>
                     <h2 className="text-secondary mb-2">No Drives Recorded</h2>
                     <p className="text-secondary m-0">Consolidate large event placements by generating a structural Drive object.</p>
                  </div>
               ) : (
                  drives.map((drive) => (
                    <div key={drive.id} className="card slide-up hover:shadow-hover transition-all" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--color-primary)' }}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '4px', fontWeight: 'bold' }}>{drive.title}</h2>
                             <p className="text-sm text-secondary m-0 tracking-wide font-medium">Target Phase: <span className="text-primary-dark">{drive.academicYear}</span></p>
                          </div>
                          <span className={`badge ${drive.status === 'UPCOMING' ? 'badge-info' : 'badge-success'}`} style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                             {drive.status}
                          </span>
                       </div>
                       
                       <p className="text-secondary text-sm mb-6" style={{ minHeight: '40px' }}>{drive.description || 'System generic drive enclosure.'}</p>

                       <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                             <div className="p-2 bg-primary-lighter text-primary rounded-full" style={{ backgroundColor: 'var(--color-primary-lighter)', color: 'var(--color-primary)' }}>
                                <Users size={16}/>
                             </div>
                             <div>
                                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-0 m-0">Node Coordinator</p>
                                <p className="font-bold text-sm m-0 text-primary-dark">{drive.createdByUser?.fullName || 'System'}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                             <div className="p-2 bg-warning-bg text-warning rounded-full" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                                <Calendar size={16}/>
                             </div>
                             <div>
                                <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-0 m-0">Initialization</p>
                                <p className="font-bold text-sm m-0 text-warning">{new Date(drive.startDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                            Linked Postings: <span className="text-primary" style={{ fontSize: '14px' }}>{drive.jobs?.length || 0}</span>
                          </span>
                          <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>View Analytics <ExternalLink size={14} className="inline ml-1"/></button>
                       </div>
                    </div>
                  ))
               )}
            </div>
         )}
      </div>
    </div>
  );
}
