import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, Download, Mail } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'), orderBy('xp_points', 'desc'));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'XP Points', 'Videos Completed', 'Certificates'];
    const rows = students.map((student) => [
      student.name || 'N/A',
      student.email || 'N/A',
      student.xp_points || 0,
      student.completed_videos || 0,
      student.certificates?.length || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_progress.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Student Management</h1>
          </div>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {students.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No students registered yet</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                      XP Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                      Videos Completed
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                      Certificates
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{student.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-300">{student.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-primary font-bold">
                        {student.xp_points || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {student.completed_videos || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {student.certificates?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
