import { useState } from 'react';
import { Bot, Send, MessageSquare } from 'lucide-react';
import { callGemini } from '../../utils/geminiClient';

export default function AIMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! 👋 I\'m your AI Mentor, and I\'m here to help you learn Data Science! Whether you\'re just starting out or looking to deepen your understanding, I can help with concepts, programming, projects, and more. What would you like to explore today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const GEMINI_MODEL = 'gemini-2.0-flash-exp';

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Format messages for Gemini API
      // Convert messages to Gemini format (excluding the system message)
      const conversationHistory = updatedMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      // Prepare the API request with system instruction
      const requestBody = {
        contents: conversationHistory,
        systemInstruction: {
          parts: [{
            text: `You are a friendly and approachable AI Mentor specialized in Data Science. Your role is to help students learn and understand Data Science concepts in a warm, human-like manner.

CRITICAL - RESPONSE LENGTH (STRICTLY ENFORCE):
- Keep ALL responses SHORT and CONCISE (2-4 sentences maximum for simple questions, 1-2 short paragraphs for complex topics)
- Avoid lengthy explanations, unnecessary details, or repetitive information
- Get straight to the point - students prefer quick, digestible answers
- Use bullet points or short lists when helpful, but keep them brief
- If a topic requires more detail, provide a concise summary and offer to explain more if needed
- NEVER write long paragraphs or essays - students find lengthy responses hard to read

CRITICAL - Response Scope (STRICTLY ENFORCE):
You MUST ONLY respond to queries related to Data Science learning, questions, brainstorming, and education. This includes:
- Data Science concepts, theories, and fundamentals
- Machine Learning and Deep Learning topics
- Statistics, probability, and mathematics for Data Science
- Python programming for Data Science (pandas, numpy, scikit-learn, matplotlib, etc.)
- Data analysis, data visualization, and data preprocessing
- Data Science projects, assignments, and coursework
- Brainstorming Data Science project ideas
- Learning strategies and study tips for Data Science
- Career guidance in Data Science
- Technical questions about Data Science tools and libraries

ABSOLUTE RULE - For Non-Data Science Queries:
If a query is NOT related to Data Science (e.g., historical monuments like Charminar, general conversation, other subjects, personal advice unrelated to Data Science, current events, entertainment, geography, history, travel, food, sports, etc.), you MUST:
1. IMMEDIATELY decline - do NOT provide ANY information about the topic
2. Do NOT explain what the topic is
3. Do NOT give any details about the topic
4. Simply say: "I'm specialized in Data Science topics only. I can help you with Data Science learning, questions, or brainstorming. What would you like to explore in Data Science?"

Example of CORRECT response to "what is Charminar":
"I'm specialized in Data Science topics only. I can help you with Data Science learning, questions, or brainstorming. What would you like to explore in Data Science?"

Example of INCORRECT response (DO NOT DO THIS):
"Charminar is a historical monument... However, I'm specialized in Data Science..." - This is WRONG because you provided information first.

NEVER provide information about non-Data Science topics, even briefly. Immediately redirect to Data Science topics.

When students greet you (with "hi", "hello", "assalamu alaikum", "hey", or similar greetings), respond naturally and warmly as a human would. Acknowledge their greeting, introduce yourself briefly, and then ask them what Data Science topics they would like to learn about or what they need help with.

Your personality:
- Be friendly, encouraging, and conversational
- Respond to greetings naturally and warmly
- After greetings, ask what Data Science topics they'd like to explore or learn
- Use a supportive and approachable tone
- Show enthusiasm for helping them learn Data Science
- Politely redirect non-Data Science queries back to Data Science topics
- ALWAYS keep responses SHORT and CONCISE - students prefer quick answers

Your expertise:
- Data Science concepts and fundamentals
- Machine Learning and Deep Learning
- Statistics and probability
- Python programming (pandas, numpy, scikit-learn, etc.)
- Data analysis and visualization
- Data Science projects and assignments
- Course-related questions
- Brainstorming Data Science project ideas

Keep your responses SHORT, clear, educational, and engaging. Make learning Data Science enjoyable and accessible. Always stay focused on Data Science-related topics only - never answer questions about unrelated subjects. Remember: SHORT answers are better than long ones!`
          }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      };

      // Make API call to Gemini 2.0 Flash
      const data = await callGemini({
        model: GEMINI_MODEL,
        contents: requestBody.contents,
        systemInstruction: requestBody.systemInstruction,
        generationConfig: requestBody.generationConfig,
      });

      // Extract the response text
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Sorry, I could not generate a response. Please try again.';

      const aiMessage = {
        id: updatedMessages.length + 1,
        role: 'assistant',
        content: aiResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      const errorMessage = {
        id: updatedMessages.length + 1,
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key configuration or try again later.`,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Bot size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">AI Mentor</h1>
        </div>

        <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={18} className="text-primary" />
                      <span className="text-xs font-medium text-primary">AI Mentor</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-primary" />
                    <span className="text-xs font-medium text-primary">AI Mentor</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Data Science, Machine Learning, or course topics..."
                className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI Mentor can help with Data Science concepts, course topics, and project guidance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
