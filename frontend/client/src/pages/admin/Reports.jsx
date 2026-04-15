import { useEffect, useState } from 'react';
import { BarChart3, Download, Users, Briefcase } from 'lucide-react';
import api from '../../config/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Controls
  const [batchYear, setBatchYear] = useState('');
  const [department, setDepartment] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (batchYear) q.append('batchYear', batchYear);
      if (department) q.append('department', department);
      
      const { data } = await api.get(`/reports/placements?${q.toString()}`);
      setReportData(data.data);
    } catch (err) {
      console.error(err);
      alert('Failed loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadCSV = () => {
    if (!reportData || reportData.placedStudents.length === 0) return alert('No data to export!');

    // Define strict columns and mappings
    const headers = ['Enrollment Number', 'Student Name', 'Email', 'Department', 'Batch Year', 'CGPA', 'Company', 'Position', 'Selection Date'];

    // Utility handling CSV edge cases (Embedded commas, nested strings)
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // If contains comma, quote, or newline -> enclose in double quotes and escape inner quotes 
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = reportData.placedStudents.map(s => [
      escapeCSV(s.enrollmentNo),
      escapeCSV(s.name),
      escapeCSV(s.email),
      escapeCSV(s.department),
      escapeCSV(s.batchYear),
      escapeCSV(s.cgpa),
      escapeCSV(s.company),
      escapeCSV(s.position),
      escapeCSV(new Date(s.dateSelected).toLocaleDateString())
    ]);

    // Construct final text block
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create Blob utilizing universal byte array structure preventing UTF-8 mismatching
    // Prefixed UTF-8 BOM so Microsoft Excel reads special characters properly
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Temporary anchor element triggering browser native safe download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `career_cove_placement_report_${batchYear || 'All'}_${department || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !reportData) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="container mt-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-primary mb-1 flex items-center gap-2"><BarChart3 size={24}/> Placement Reports</h1>
          <p className="text-secondary text-sm">Deep analytics and extractable data structures for HODs and Admins.</p>
        </div>
        
        <div className="flex gap-4">
           <select className="form-select" style={{ minWidth: '150px' }} value={batchYear} onChange={e => setBatchYear(e.target.value)}>
             <option value="">All Years</option>
             <option value="2024">2024</option>
             <option value="2025">2025</option>
             <option value="2026">2026</option>
           </select>
           <select className="form-select" style={{ minWidth: '150px' }} value={department} onChange={e => setDepartment(e.target.value)}>
             <option value="">All Departments</option>
             <option value="Computer Science">Computer Science</option>
             <option value="Information Tech">Information Tech</option>
             <option value="Electronics">Electronics</option>
             <option value="Mechanical">Mechanical</option>
           </select>
           <button className="btn btn-outline" onClick={fetchReports}>Apply Filter</button>
           <button className="btn btn-success flex items-center gap-2" onClick={downloadCSV}>
             <Download size={18} /> Export CSV
           </button>
        </div>
      </div>

      {loading && <p className="text-center text-secondary">Updating data...</p>}
      
      {reportData && (
         <>
         <div className="grid grid-cols-3 mb-6 gap-6">
           <div className="card text-center" style={{ padding: 'var(--space-6)'}}>
              <Users size={32} className="mx-auto mb-2 text-primary opacity-75" />
              <h2 className="text-2xl font-bold mb-1">{reportData.totalStudents}</h2>
              <p className="text-secondary text-sm m-0">Eligible Students</p>
           </div>
           <div className="card text-center" style={{ padding: 'var(--space-6)'}}>
              <Briefcase size={32} className="mx-auto mb-2 text-success opacity-75" />
              <h2 className="text-2xl font-bold mb-1 text-success">{reportData.totalPlaced}</h2>
              <p className="text-secondary text-sm m-0">Placed Total</p>
           </div>
           <div className="card text-center" style={{ padding: 'var(--space-6)', border: '2px solid var(--color-success)'}}>
              <BarChart3 size={32} className="mx-auto mb-2 text-success opacity-75" />
              <h2 className="text-2xl font-bold mb-1 text-success">{reportData.placementPercentage}%</h2>
              <p className="text-secondary text-sm m-0">Global Rate</p>
           </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="card">
               <h3 className="card-title mb-4">Department Base Breakdown</h3>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <th className="py-2">Department</th>
                        <th className="py-2">Total</th>
                        <th className="py-2">Placed</th>
                        <th className="py-2">Rate</th>
                     </tr>
                  </thead>
                  <tbody>
                     {Object.entries(reportData.departmentWise).map(([dept, counts]) => (
                        <tr key={dept} style={{ borderBottom: '1px solid var(--color-border)' }}>
                           <td className="py-2 text-sm">{dept}</td>
                           <td className="py-2">{counts.total}</td>
                           <td className="py-2">{counts.placed}</td>
                           <td className="py-2 font-medium text-success">
                              {counts.total > 0 ? ((counts.placed / counts.total)*100).toFixed(1) : 0}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="card flex flex-col justify-center text-center">
               <p className="text-secondary mb-4">Export deep data utilizing the CSV generator for granular mapping preventing arbitrary data leaks. Your native spreadsheet tools will interpret constraints.</p>
               <button className="btn btn-primary mx-auto gap-2" onClick={downloadCSV}>
                 <Download size={20} /> Generate Spreadsheet Array
               </button>
            </div>
         </div>
         </>
      )}
    </div>
  );
}
