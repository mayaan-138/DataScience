import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { mockAuth } from '../../utils/auth';

export default function PerformanceReports() {
  const navigate = useNavigate();
  const user = mockAuth.getCurrentUser();
  
  const [mockInterviews, setMockInterviews] = useState([]);
  const [behavioralSessions, setBehavioralSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageTechnicalScore: 0,
    averageBehavioralScore: 0,
    totalInterviews: 0,
    totalBehavioralSessions: 0,
    improvement: 0,
  });

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [user]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Load mock interviews
      const interviewsQuery = query(
        collection(db, 'mock_interviews'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      const interviews = interviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMockInterviews(interviews);

      // Load behavioral sessions
      const behavioralQuery = query(
        collection(db, 'behavioral_feedback'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );
      const behavioralSnapshot = await getDocs(behavioralQuery);
      const behavioral = behavioralSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBehavioralSessions(behavioral);

      // Calculate stats
      if (interviews.length > 0) {
        const avgTechnical = interviews.reduce((sum, i) => sum + (i.technical_score || i.overall_score || 0), 0) / interviews.length;
        const avgOverall = interviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) / interviews.length;
        
        // Calculate improvement (compare first vs last)
        let improvement = 0;
        if (interviews.length >= 2) {
          const firstScore = interviews[interviews.length - 1].overall_score || 0;
          const lastScore = interviews[0].overall_score || 0;
          improvement = lastScore - firstScore;
        }

        setStats({
          averageTechnicalScore: Math.round(avgTechnical),
          averageBehavioralScore: behavioral.length > 0
            ? Math.round(behavioral.reduce((sum, b) => sum + (b.overall_score || 0), 0) / behavioral.length)
            : 0,
          totalInterviews: interviews.length,
          totalBehavioralSessions: behavioral.length,
          improvement: Math.round(improvement),
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/interview')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white">Performance Reports</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading performance data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-[#DC4D01]" size={24} />
                  <h3 className="text-sm font-medium text-gray-400">Average Technical Score</h3>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(stats.averageTechnicalScore)}`}>
                  {stats.averageTechnicalScore}/100
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-[#DC4D01]" size={24} />
                  <h3 className="text-sm font-medium text-gray-400">Average Behavioral Score</h3>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(stats.averageBehavioralScore)}`}>
                  {stats.averageBehavioralScore}/100
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-[#DC4D01]" size={24} />
                  <h3 className="text-sm font-medium text-gray-400">Total Interviews</h3>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalInterviews}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-[#DC4D01]" size={24} />
                  <h3 className="text-sm font-medium text-gray-400">Improvement</h3>
                </div>
                <div className={`text-3xl font-bold ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
                </div>
              </motion.div>
            </div>

            {/* Mock Interview History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Mock Interview History</h2>
              {mockInterviews.length > 0 ? (
                <div className="space-y-4">
                  {mockInterviews.map((interview, idx) => (
                    <div
                      key={interview.id || idx}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">{interview.role || 'Interview'}</h3>
                          <p className="text-sm text-gray-400">
                            {interview.difficulty || 'N/A'} • {new Date(interview.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(interview.overall_score || 0)}`}>
                            {interview.overall_score || 0}/100
                          </div>
                          <p className="text-xs text-gray-400">Overall Score</p>
                        </div>
                      </div>
                      {interview.technical_score && (
                        <div className="mt-2 text-sm text-gray-400">
                          Technical: {interview.technical_score}/100 • Communication: {interview.communication_score || 0}/100
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Target className="mx-auto mb-4 text-gray-600" size={48} />
                  <p>No mock interviews yet. Start your first interview to see your progress!</p>
                </div>
              )}
            </motion.div>

            {/* Behavioral Session History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Behavioral Interview History</h2>
              {behavioralSessions.length > 0 ? (
                <div className="space-y-4">
                  {behavioralSessions.map((session, idx) => (
                    <div
                      key={session.id || idx}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{session.question || 'Question'}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-bold ${getScoreColor(session.overall_score || 0)}`}>
                            {session.overall_score || 0}/100
                          </div>
                          <p className="text-xs text-gray-400">Overall Score</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Tone:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(session.tone_score || 0)}`}>
                            {session.tone_score || 0}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Clarity:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(session.clarity_score || 0)}`}>
                            {session.clarity_score || 0}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Structure:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(session.structure_score || 0)}`}>
                            {session.structure_score || 0}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="mx-auto mb-4 text-gray-600" size={48} />
                  <p>No behavioral sessions yet. Start practicing to see your progress!</p>
                </div>
              )}
            </motion.div>

            {/* Insights */}
            {stats.improvement > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 bg-[#DC4D01]/10 border border-[#DC4D01] rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-[#DC4D01]" size={24} />
                  <h3 className="text-xl font-bold text-white">Great Progress!</h3>
                </div>
                <p className="text-gray-300">
                  You've improved your interview scores by {stats.improvement}% since you started. Keep practicing to maintain this momentum!
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

