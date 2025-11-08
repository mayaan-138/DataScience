import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionBank() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mode, setMode] = useState('practice'); // 'practice' or 'quiz'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizResults, setQuizResults] = useState({});

  const topics = [
    { id: 'all', label: 'All Topics' },
    { id: 'python', label: 'Python' },
    { id: 'sql', label: 'SQL' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'machine-learning', label: 'Machine Learning' },
    { id: 'deep-learning', label: 'Deep Learning' },
    { id: 'generative-ai', label: 'Generative AI' },
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  // Sample questions (in production, fetch from Firestore)
  const questions = [
    {
      id: 1,
      topic: 'python',
      difficulty: 'easy',
      question: 'What is the difference between a list and a tuple in Python?',
      answer: 'A list is mutable (can be modified), while a tuple is immutable (cannot be modified). Lists use square brackets [], tuples use parentheses ().',
    },
    {
      id: 2,
      topic: 'sql',
      difficulty: 'medium',
      question: 'Explain the difference between INNER JOIN and LEFT JOIN.',
      answer: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table, with NULL for non-matching rows.',
    },
    {
      id: 3,
      topic: 'machine-learning',
      difficulty: 'hard',
      question: 'Explain the bias-variance tradeoff in machine learning.',
      answer: 'Bias is the error from oversimplifying assumptions. Variance is the error from sensitivity to small fluctuations. High bias leads to underfitting, high variance leads to overfitting. The goal is to balance both.',
    },
    {
      id: 4,
      topic: 'statistics',
      difficulty: 'medium',
      question: 'What is the difference between correlation and causation?',
      answer: 'Correlation means two variables are related. Causation means one variable directly causes the other. Correlation does not imply causation - there may be confounding variables.',
    },
    {
      id: 5,
      topic: 'deep-learning',
      difficulty: 'hard',
      question: 'Explain how backpropagation works in neural networks.',
      answer: 'Backpropagation is the process of calculating gradients by propagating errors backward through the network. It uses the chain rule to compute gradients for each weight, allowing the network to learn from errors.',
    },
    {
      id: 6,
      topic: 'generative-ai',
      difficulty: 'medium',
      question: 'What is the difference between a transformer and a traditional RNN?',
      answer: 'Transformers use self-attention mechanisms to process sequences in parallel, while RNNs process sequentially. Transformers can capture long-range dependencies better and are more efficient for training.',
    },
  ];

  const filteredQuestions = questions.filter((q) => {
    const topicMatch = selectedTopic === 'all' || q.topic === selectedTopic;
    const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return topicMatch && difficultyMatch;
  });

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/20 border-green-500';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'hard': return 'text-red-400 bg-red-900/20 border-red-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
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
          <h1 className="text-3xl font-bold text-white">Technical Question Bank</h1>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setCurrentQuestionIndex(0);
                  setShowAnswer(false);
                }}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#DC4D01] text-white"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setCurrentQuestionIndex(0);
                  setShowAnswer(false);
                }}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#DC4D01] text-white"
              >
                {difficulties.map((diff) => (
                  <option key={diff.id} value={diff.id}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Practice Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMode('practice');
                    setShowAnswer(false);
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    mode === 'practice'
                      ? 'bg-[#DC4D01] text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => {
                    setMode('quiz');
                    setShowAnswer(false);
                    setUserAnswer('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    mode === 'quiz'
                      ? 'bg-[#DC4D01] text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Quiz
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredQuestions.length} question(s)
          </div>
        </div>

        {/* Question Display */}
        {filteredQuestions.length > 0 && currentQuestion ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="text-[#DC4D01]" size={24} />
                <span className="text-sm text-gray-400">
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty.toUpperCase()}
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white mb-6">{currentQuestion.question}</h2>

            {/* Answer Input (Quiz Mode) */}
            {mode === 'quiz' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#DC4D01] text-white resize-none"
                />
              </div>
            )}

            {/* Answer Display (Practice Mode) */}
            {mode === 'practice' && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all mb-4"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff size={18} />
                      <span>Hide Answer</span>
                    </>
                  ) : (
                    <>
                      <Eye size={18} />
                      <span>Show Answer</span>
                    </>
                  )}
                </button>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gray-800 rounded-lg p-4 border border-[#DC4D01]/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span className="font-medium text-white">Answer:</span>
                    </div>
                    <p className="text-gray-300">{currentQuestion.answer}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === filteredQuestions.length - 1}
                className="flex-1 py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === filteredQuestions.length - 1 ? 'Finish' : 'Next Question'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
            <Search className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">No questions found with the selected filters.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

