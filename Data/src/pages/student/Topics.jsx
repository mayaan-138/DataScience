import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BookOpen, Video, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Default topics data
  const defaultTopics = [
    {
      id: 'advanced-statistics',
      topic_name: 'Advanced Statistics',
      description: 'Understand data distribution, hypothesis testing, probability theory, and regression foundations for analytics and ML.',
      total_videos: 12
    },
    {
      id: 'machine-learning',
      topic_name: 'Machine Learning',
      description: 'Learn supervised and unsupervised algorithms, model evaluation, and deployment concepts to build intelligent systems.',
      total_videos: 18
    },
    {
      id: 'deep-learning',
      topic_name: 'Deep Learning',
      description: 'Explore neural networks, CNNs, RNNs, and modern AI architectures that power image, text, and speech recognition.',
      total_videos: 15
    },
    {
      id: 'generative-ai',
      topic_name: 'Generative AI',
      description: 'Master prompt engineering, large language models (LLMs), and content generation using tools like ChatGPT and Gemini.',
      total_videos: 10
    }
  ];

  useEffect(() => {
    // Show page immediately, load data in background
    setLoading(false);
    
    const fetchTopics = async () => {
      try {
        // Add timeout to prevent hanging (1 second max)
        const querySnapshot = await Promise.race([
          getDocs(collection(db, 'lectures')),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        ]);
        const topicsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicsData);
      } catch (error) {
        // Firestore is optional - use default topics
        setTopics(defaultTopics);
      }
    };

    fetchTopics();
  }, []);

  // Use default topics if Firestore is empty
  const displayTopics = topics.length > 0 ? topics : defaultTopics;

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
          <BookOpen size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Topics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayTopics.map((topic) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-800 hover:border-primary transition-all overflow-hidden glow-on-hover"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topic.topic_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Video size={16} />
                  <span>{topic.total_videos || 0} videos</span>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {topic.description}
                  </p>
                  <button
                    onClick={() => navigate(`/lectures?topic=${topic.id}`)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all text-sm flex items-center gap-2"
                  >
                    View Lectures
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
