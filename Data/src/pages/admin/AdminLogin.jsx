import { useState } from 'react';
import { mockAuth } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, ArrowLeft } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify admin credentials
      if (email === 'datascience1424@gmail.com' && password === 'Science@1424') {
        const user = mockAuth.login(email, password);
        
        // Save admin to 'admin' collection in Firestore
        try {
          const adminRef = doc(db, 'admin', user.uid);
          await setDoc(adminRef, {
            admin_id: user.uid,
            email: email,
            name: user.displayName || 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }, { merge: true });
          console.log('Admin profile saved/updated in Firestore');
        } catch (dbError) {
          console.error('Error saving admin to Firestore:', dbError);
          setError('Login successful but failed to save to database. Please check Firebase configuration.');
          setLoading(false);
          return;
        }
        
        setLoading(false);
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Invalid admin credentials.');
        mockAuth.logout();
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Panel</h1>
          <p className="text-gray-400">DataScience Academy Management</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
