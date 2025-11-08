import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged, mockAuth } from '../../utils/auth';
import { db } from '../../firebase/config';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'students'),
          orderBy('xp_points', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const leaderboardData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // If no data, show sample data
        setLeaderboard([
          {
            id: '1',
            name: 'John Doe',
            xp_points: 1250,
            completed_videos: 24,
          },
          {
            id: '2',
            name: 'Jane Smith',
            xp_points: 980,
            completed_videos: 18,
          },
          {
            id: '3',
            name: 'Mike Johnson',
            xp_points: 850,
            completed_videos: 15,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400" />;
    if (rank === 3) return <Award size={24} className="text-orange-400" />;
    return <span className="text-gray-500 font-bold">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-900/20 border-yellow-500';
    if (rank === 2) return 'bg-gray-900/20 border-gray-400';
    if (rank === 3) return 'bg-orange-900/20 border-orange-500';
    return 'bg-gray-900 border-gray-800';
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900">
            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-3">XP Points</div>
              <div className="col-span-3">Videos Completed</div>
            </div>
          </div>

          <div className="divide-y divide-gray-800">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
                <p>No leaderboard data available yet</p>
              </div>
            ) : (
              leaderboard.map((student, index) => {
                const rank = index + 1;
                const isCurrentUser = user && student.id === user.uid;
                return (
                  <div
                    key={student.id}
                    className={`p-4 hover:bg-gray-800 transition-all ${
                      isCurrentUser ? 'bg-primary/10 border-l-4 border-primary' : ''
                    } ${getRankColor(rank)}`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <div className="col-span-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {student.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {student.name || 'Anonymous'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-primary">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{student.email || ''}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <span className="text-primary font-bold">
                          {student.xp_points || 0} XP
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-gray-300">
                          {student.completed_videos || 0} videos
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {user && !leaderboard.find((s) => s.id === user.uid) && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm text-center">
              Complete more videos and projects to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
