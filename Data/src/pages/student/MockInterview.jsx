import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { mockAuth } from '../../utils/auth';

export default function MockInterview() {
  const navigate = useNavigate();
  const user = mockAuth.getCurrentUser();
  
  const [step, setStep] = useState('setup'); // 'setup', 'interview', 'results'
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_MODEL = 'gemini-2.0-flash-exp';

  const roles = ['Data Analyst', 'ML Engineer', 'AI Developer', 'Data Scientist'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const questionCounts = [5, 10, 15];

  // Generate interview questions
  const generateQuestions = async () => {
    if (!role || !difficulty) {
      alert('Please select a role and difficulty level');
      return;
    }

    setLoading(true);
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key is not configured');
      }

      const prompt = `You are an AI Interviewer for ${role} positions at ${difficulty} level.

Generate exactly ${numQuestions} interview questions for this role and difficulty level.

Return ONLY a JSON array of questions in this format:
[
  {"question": "Question 1 text"},
  {"question": "Question 2 text"},
  ...
]

Make questions relevant to ${role} role at ${difficulty} level. Focus on technical skills, problem-solving, and domain knowledge.

Return ONLY the JSON array, no additional text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const generatedQuestions = JSON.parse(jsonMatch[0]);
      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(''));
      setStep('interview');
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer and move to next question
  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer.trim();
    setAnswers(newAnswers);
    const savedAnswer = currentAnswer.trim();
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load next question's answer if exists
      setTimeout(() => {
        setCurrentAnswer(newAnswers[currentQuestionIndex + 1] || '');
      }, 0);
    } else {
      // All questions answered, generate feedback
      generateFeedback(newAnswers);
    }
  };

  // Generate AI feedback
  const generateFeedback = async (finalAnswers) => {
    setLoading(true);
    try {
      const answersToUse = finalAnswers || answers;
      const prompt = `You are an AI Interview Evaluator. Evaluate the interview answers for a ${role} position at ${difficulty} level.

Questions and Answers:
${questions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${answersToUse[i] || 'No answer provided'}\n`).join('\n')}

Evaluate each answer on:
1. Technical correctness
2. Keyword relevance
3. Clarity of explanation
4. Depth of knowledge

Return a JSON object with this structure:
{
  "overall_score": <number 0-100>,
  "technical_score": <number 0-100>,
  "communication_score": <number 0-100>,
  "strengths": [<array of strengths>],
  "weaknesses": [<array of weaknesses>],
  "suggestions": [<array of improvement suggestions>],
  "question_feedback": [
    {"question": "Q1", "score": <0-100>, "feedback": "..."},
    ...
  ]
}

Return ONLY valid JSON, no additional text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate feedback');

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid feedback format');

      const feedback = JSON.parse(jsonMatch[0]);
      setResults(feedback);
      setStep('results');

      // Save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'mock_interviews'), {
            user_id: user.uid,
            role,
            difficulty,
            num_questions: numQuestions,
            overall_score: feedback.overall_score,
            technical_score: feedback.technical_score,
            communication_score: feedback.communication_score,
            feedback: feedback,
            answers: answersToUse,
            questions: questions,
            date: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error('Error saving to Firestore:', dbError);
        }
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Failed to generate feedback. Please try again.');
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/interview')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white">AI Mock Interview</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* Setup Step */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Configure Your Interview</h2>

              <div className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Job Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`p-4 rounded-lg border transition-all ${
                          role === r
                            ? 'border-[#DC4D01] bg-[#DC4D01]/10 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`p-4 rounded-lg border transition-all ${
                          difficulty === d
                            ? 'border-[#DC4D01] bg-[#DC4D01]/10 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {questionCounts.map((count) => (
                      <button
                        key={count}
                        onClick={() => setNumQuestions(count)}
                        className={`p-4 rounded-lg border transition-all ${
                          numQuestions === count
                            ? 'border-[#DC4D01] bg-[#DC4D01]/10 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {count} Questions
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateQuestions}
                  disabled={loading || !role || !difficulty}
                  className="w-full py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <span>Start Interview</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Interview Step */}
          {step === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6"
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-[#DC4D01] h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {questions[currentQuestionIndex]?.question}
                </h2>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#DC4D01] text-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => {
                      // Save current answer before moving
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex] = currentAnswer.trim();
                      setAnswers(newAnswers);
                      
                      // Move to previous question
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
                    }}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || loading}
                  className="flex-1 py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : currentQuestionIndex < questions.length - 1 ? (
                    <>
                      <span>Next Question</span>
                      <Send size={18} />
                    </>
                  ) : (
                    <>
                      <span>Finish Interview</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Scores */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Interview Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-2">Overall Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(results.overall_score)}`}>
                      {results.overall_score}/100
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-2">Technical Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(results.technical_score)}`}>
                      {results.technical_score}/100
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-2">Communication Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(results.communication_score)}`}>
                      {results.communication_score}/100
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {results.strengths && results.strengths.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="text-green-400" size={20} />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {results.strengths.map((strength, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {results.weaknesses && results.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="text-yellow-400" size={20} />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {results.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {results.suggestions && results.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="text-[#DC4D01]" size={20} />
                      Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {results.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-2">
                          <span className="text-[#DC4D01] mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep('setup');
                    setQuestions([]);
                    setAnswers([]);
                    setResults(null);
                    setCurrentQuestionIndex(0);
                  }}
                  className="flex-1 py-3 bg-[#DC4D01] text-white rounded-lg font-medium hover:bg-[#DC4D01]/90 transition-all"
                >
                  Start New Interview
                </button>
                <button
                  onClick={() => navigate('/interview/performance')}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  View Performance Reports
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

