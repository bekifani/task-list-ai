import { useState } from 'react';
import axios from 'axios';
import "tailwindcss"

export default function TaskGenerator({ onTasksGenerated, darkMode }) {
  const [context, setContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTasks = async () => {
    if (!context.trim()) {
      setError('Please enter a context to generate tasks.');
      return;
    }
    
    // Check for API key from input field or environment variable
    const openaiApiKey = apiKey.trim() || import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      setError('Please enter your OpenAI API key or set it in environment variables.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = `Based on the context: "${context}", generate exactly 4 tasks to help accomplish this goal. 
      
      Return ONLY a valid JSON array with this exact structure:
      [
        {
          "name": "Task name",
          "description": "Detailed description of what needs to be done",
          "timeframe": "estimated time (e.g., '2 hours', '1 day', '30 minutes')"
        }
      ]
      
      Make sure each task is actionable, specific, and includes a realistic timeframe estimate.`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
        }
      );

      const responseText = res.data.choices[0].message.content.trim();
      
      // Parse the JSON response
      let tasks;
      try {
        tasks = JSON.parse(responseText);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tasks = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      // Add unique IDs and completion status to tasks
      const tasksWithIds = tasks.map((task, index) => ({
        ...task,
        id: Date.now() + index,
        completed: false,
        createdAt: new Date().toISOString()
      }));

      onTasksGenerated(tasksWithIds);
      setContext(''); // Clear input after successful generation
      
    } catch (err) {
      console.error('Error generating tasks:', err);
      if (err.response?.status === 401) {
        setError('Invalid API key. Please check your OpenAI API key and try again.');
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError('Failed to generate tasks. Please check your API key and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateTasks();
    }
  };

  return (
    <div className={`max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Generate New Tasks</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Describe your goal and we'll create actionable tasks</p>
      </div>

      <div className="px-6 py-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              OpenAI API Key
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                (Optional - for testing purposes)
              </span>
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-... (Enter your OpenAI API key to test)"
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What do you want to accomplish?
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Example: 'Prepare for my final exams', 'Plan a summer vacation', 'Organize my home office'"
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                rows={4}
              />
              <div className="absolute bottom-2 right-2 flex items-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {loading ? 'Processing...' : 'Press Enter to submit'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {context.trim() ? (
                <span>{context.trim().split(/\s+/).length} words</span>
              ) : (
                <span>Describe your goal in detail</span>
              )}
            </div>
            <button
              onClick={generateTasks}
              disabled={loading || !context.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || !context.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Tasks
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error generating tasks</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}