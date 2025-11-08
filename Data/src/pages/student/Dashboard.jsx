import { useState, useEffect } from 'react';
import { onAuthStateChanged, mockAuth } from '../../utils/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User, Video, Award, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      // Show page immediately, load data in background
      setLoading(false);
      if (currentUser) {
        fetchStudentData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchStudentData = async (uid) => {
    try {
      // Add timeout to prevent hanging (1 second max)
      const docRef = doc(db, 'students', uid);
      const docSnap = await Promise.race([
        getDoc(docRef),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      ]);
      if (docSnap.exists()) {
        setStudentData(docSnap.data());
      }
    } catch (error) {
      // Firestore is optional - continue without student data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = [
    {
      icon: Video,
      label: 'Videos Completed',
      value: studentData?.completed_videos || 0,
      color: 'text-blue-400',
    },
    {
      icon: Award,
      label: 'XP Points',
      value: studentData?.xp_points || 0,
      color: 'text-primary',
    },
    {
      icon: Award,
      label: 'Certificates',
      value: studentData?.certificates?.length || 0,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Profile Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {studentData?.name || user?.displayName || 'Student'}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(studentData?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 glow-on-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={24} className={stat.color} />
                  <TrendingUp size={20} className="text-gray-600" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Course Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-primary font-medium">25%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: '25%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-400">
              <Video size={18} />
              <span>Started watching: Introduction to Statistics</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Award size={18} />
              <span>Earned 50 XP points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
