import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Users, RefreshCw } from 'lucide-react';
import api from '../../config/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const fileInputRef = useRef(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students');
      setStudents(data.data.students || []);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/students/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setStatus({ type: 'error', message: 'Failed to export students' });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    setStatus({ type: '', message: '' });
    
    try {
      const { data } = await api.post('/admin/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: `Imported ${data.data.imported} records successfully.` });
      if (data.data.failed > 0) {
        console.warn('Import errors:', data.data.errors);
      }
      fetchStudents();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Import failed' });
    } finally {
      setImporting(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading && students.length === 0) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="container mt-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-lighter)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-primary mb-1">Student Management</h1>
            <p className="text-secondary text-sm">View, import, and export student placement records</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button 
            className="btn btn-outline gap-2" 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
            Bulk Import CSV
          </button>
          
          <button className="btn btn-primary gap-2" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type} mb-4`}>
          {status.message}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Enrollment No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Batch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s.userId}>
                  <td>{s.enrollmentNumber}</td>
                  <td>{s.user?.fullName}</td>
                  <td>{s.user?.email}</td>
                  <td>{s.department}</td>
                  <td>{s.batchYear}</td>
                  <td>
                    <span className={`status-badge status-${s.isPlaced ? 'active' : 'pending'}`}>
                      {s.isPlaced ? 'Placed' : 'Eligible'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No students found. Use Bulk Import to add them.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
