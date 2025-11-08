import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MessageSquare, BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewDashboard() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'mock-interview',
      title: 'AI Mock Interview',
      description: 'Practice real interview scenarios with AI. Get instant feedback on your answers.',
      icon: Target,
      color: 'bg-[#DC4D01]',
      path: '/interview/mock',
    },
    {
      id: 'technical-questions',
      title: 'Technical Question Bank',
      description: 'Practice Python, SQL, ML, and Data Science questions with detailed solutions.',
      icon: BookOpen,
      color: 'bg-[#DC4D01]',
      path: '/interview/questions',
    },
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      description: 'Master HR questions with AI feedback on tone, structure, and confidence.',
      icon: MessageSquare,
      color: 'bg-[#DC4D01]',
      path: '/interview/behavioral',
    },
    {
      id: 'performance',
      title: 'Performance Reports',
      description: 'Track your progress, view analytics, and see improvement trends.',
      icon: BarChart3,
      color: 'bg-[#DC4D01]',
      path: '/interview/performance',
    },
  ];

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Interview Preparation Center
          </h1>
          <p className="text-gray-400 text-lg">
            Get job-ready with AI-powered interview training and practice
          </p>
        </motion.div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(module.path)}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-[#DC4D01] transition-all cursor-pointer group hover:shadow-[0_0_15px_rgba(220,77,1,0.3)]"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${module.color} rounded-lg p-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={32} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                    
                    <button className="flex items-center gap-2 text-[#DC4D01] font-medium hover:text-[#DC4D01]/80 transition-colors group-hover:gap-3">
                      <span>Start</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-[#DC4D01] font-bold text-lg mb-2">💡 Practice Daily</div>
              <p className="text-gray-400 text-sm">Consistent practice improves confidence and performance</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-[#DC4D01] font-bold text-lg mb-2">📝 Review Feedback</div>
              <p className="text-gray-400 text-sm">Learn from AI feedback to improve your answers</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-[#DC4D01] font-bold text-lg mb-2">🎯 Focus on Weak Areas</div>
              <p className="text-gray-400 text-sm">Use performance reports to identify improvement areas</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

