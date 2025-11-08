import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BookOpen, Users, Video, Award } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalStudents: 0,
    totalVideos: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch topics
        const topicsSnapshot = await getDocs(collection(db, 'lectures'));
        const topicsData = topicsSnapshot.docs.map((doc) => doc.data());
        
        // Calculate total videos
        const totalVideos = topicsData.reduce(
          (sum, topic) => sum + (topic.total_videos || 0),
          0
        );

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        
        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));

        setStats({
          totalTopics: topicsSnapshot.size,
          totalStudents: studentsSnapshot.size,
          totalVideos: totalVideos,
          totalProjects: projectsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      icon: BookOpen,
      label: 'Total Topics',
      value: stats.totalTopics,
      color: 'text-blue-400',
    },
    {
      icon: Users,
      label: 'Total Students',
      value: stats.totalStudents,
      color: 'text-green-400',
    },
    {
      icon: Video,
      label: 'Total Videos',
      value: stats.totalVideos,
      color: 'text-primary',
    },
    {
      icon: Award,
      label: 'Total Projects',
      value: stats.totalProjects,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 glow-on-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={24} className={stat.color} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/lectures'}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
            >
              Add New Lecture
            </button>
            <button
              onClick={() => window.location.href = '/admin/projects'}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
            >
              Add New Project
            </button>
            <button
              onClick={() => window.location.href = '/admin/students'}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
            >
              View Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
