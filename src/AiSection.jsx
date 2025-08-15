import { useState } from 'react';
import axios from 'axios';

export default function AISection() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Tell me a short joke about ${prompt}` }],
          max_tokens: 50,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
        }
      );
      setResult(res.data.choices[0].message.content);
    } catch (err) {
      setError('Something went wrong. Check your API key or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">AI Joke Generator</h2>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a topic..."
        className="border p-2 rounded w-full mb-4"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Generating...' : 'Generate Joke'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <p className="mt-4 p-3 bg-gray-100 rounded">{result}</p>
      )}
    </div>
  );
}
