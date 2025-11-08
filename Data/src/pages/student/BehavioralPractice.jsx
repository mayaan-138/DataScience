import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader, CheckCircle, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { mockAuth } from '../../utils/auth';
import { callGemini } from '../../utils/geminiClient';

export default function BehavioralPractice() {
  const navigate = useNavigate();
  const user = mockAuth.getCurrentUser();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const GEMINI_MODEL = 'gemini-2.0-flash-exp';

  const behavioralQuestions = [
    "Tell me about yourself.",
    "What's your biggest weakness?",
    "Describe a project you're proud of.",
    "How do you handle stress and pressure?",
    "Why do you want to work here?",
    "Where do you see yourself in 5 years?",
    "Describe a time you worked in a team.",
    "What motivates you?",
    "Tell me about a challenge you overcame.",
    "Why should we hire you?",
  ];

  const currentQuestion = behavioralQuestions[currentQuestionIndex];

  const handleAnalyzeAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setLoading(true);
    setFeedback(null);
    setShowFeedback(false);

    try {
      const prompt = `You are an HR Interview Coach. Analyze the following behavioral interview answer for tone, clarity, structure (STAR method), and confidence.

Question: ${currentQuestion}
Answer: ${userAnswer}

Evaluate the answer on:
1. Tone (professional, confident, authentic)
2. Structure (Situation → Task → Action → Result)
3. Clarity of communication
4. Use of measurable outcomes
5. Confidence keywords

Return a JSON object with this structure:
{
  "tone_score": <number 0-100>,
  "clarity_score": <number 0-100>,
  "structure_score": <number 0-100>,
  "overall_score": <number 0-100>,
  "feedback": "<overall feedback text>",
  "strengths": [<array of strengths>],
  "weaknesses": [<array of weaknesses>],
  "suggestions": [<array of improvement suggestions>],
  "star_analysis": {
    "situation": "<found or missing>",
    "task": "<found or missing>",
    "action": "<found or missing>",
    "result": "<found or missing>"
  }
}

Return ONLY valid JSON, no additional text.`;

      const data = await callGemini({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const analysis = JSON.parse(jsonMatch[0]);
      setFeedback(analysis);
      setShowFeedback(true);

      // Save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'behavioral_feedback'), {
            user_id: user.uid,
            question: currentQuestion,
            answer: userAnswer,
            tone_score: analysis.tone_score,
            clarity_score: analysis.clarity_score,
            structure_score: analysis.structure_score,
            overall_score: analysis.overall_score,
            feedback: analysis.feedback,
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            suggestions: analysis.suggestions || [],
            date: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error('Error saving to Firestore:', dbError);
        }
      }
    } catch (error) {
      console.error('Error analyzing answer:', error);
      alert('Failed to analyze answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < behavioralQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/interview')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white">Behavioral Interview Practice</h1>
        </div>

        {/* Progress */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {behavioralQuestions.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentQuestionIndex + 1) / behavioralQuestions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-[#DC4D01] h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / behavioralQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-[#DC4D01]" size={24} />
            <h2 className="text-xl font-bold text-white">Question</h2>
          </div>
          <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion}</h3>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Answer
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here. Use the STAR method (Situation, Task, Action, Result)..."
              rows={8}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#DC4D01] text-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Structure your answer using STAR method - Situation, Task, Action, Result
            </p>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeAnswer}
            disabled={!userAnswer.trim() || loading}
            className="w-full py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Analyzing Answer...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Get AI Feedback</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Feedback Display */}
        <AnimatePresence>
          {showFeedback && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">AI Feedback</h2>

              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Overall</div>
                  <div className={`text-3xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                    {feedback.overall_score}/100
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Tone</div>
                  <div className={`text-3xl font-bold ${getScoreColor(feedback.tone_score)}`}>
                    {feedback.tone_score}/100
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Clarity</div>
                  <div className={`text-3xl font-bold ${getScoreColor(feedback.clarity_score)}`}>
                    {feedback.clarity_score}/100
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">Structure</div>
                  <div className={`text-3xl font-bold ${getScoreColor(feedback.structure_score)}`}>
                    {feedback.structure_score}/100
                  </div>
                </div>
              </div>

              {/* Overall Feedback */}
              {feedback.feedback && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Overall Feedback</h3>
                  <p className="text-gray-300 bg-gray-800 rounded-lg p-4">{feedback.feedback}</p>
                </div>
              )}

              {/* STAR Analysis */}
              {feedback.star_analysis && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">STAR Method Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(feedback.star_analysis).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          value === 'found'
                            ? 'bg-green-900/20 border-green-500 text-green-400'
                            : 'bg-red-900/20 border-red-500 text-red-400'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{key}</div>
                        <div className="text-xs mt-1">{value === 'found' ? '✓ Found' : '✗ Missing'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={20} />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="text-yellow-400" size={20} />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="text-[#DC4D01]" size={20} />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-2">
                        <span className="text-[#DC4D01] mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
            disabled={currentQuestionIndex === behavioralQuestions.length - 1}
            className="flex-1 py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === behavioralQuestions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

