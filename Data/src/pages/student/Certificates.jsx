import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, mockAuth } from '../../utils/auth';
import { db } from '../../firebase/config';
import { Award, Download } from 'lucide-react';

export default function Certificates() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCertificates(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCertificates = async (uid) => {
    try {
      const docRef = doc(db, 'students', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    // In a real implementation, this would generate and download a PDF certificate
    alert(`Downloading certificate: ${certificate.course_name}`);
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
        <div className="flex items-center gap-3 mb-8">
          <Award size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Certificates</h1>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800">
            <Award size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No certificates earned yet</p>
            <p className="text-sm text-gray-500">
              Complete courses to earn certificates and showcase your achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 glow-on-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <Award size={32} className="text-primary" />
                  <button
                    onClick={() => handleDownload(certificate)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Download size={20} className="text-gray-400" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {certificate.course_name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Issued on {new Date(certificate.date_issued).toLocaleDateString()}
                </p>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-primary text-sm font-medium">
                    Certificate of Completion
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sample Certificate Preview */}
        {certificates.length === 0 && (
          <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 mt-8">
            <div className="max-w-2xl mx-auto text-center">
              <Award size={64} className="text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Complete Your First Course!
              </h2>
              <p className="text-gray-400 mb-6">
                Finish all video lectures and complete a project to earn your first certificate.
              </p>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-sm text-gray-400">
                  Certificates will appear here once you complete courses and projects.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
