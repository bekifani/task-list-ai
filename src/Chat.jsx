// src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AISection from './AiSection';

export default function App() {
  const [joke, setJoke] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/joke')
      .then(res => setJoke(res.data.text))
      .catch(console.error);
  }, []);

    return (
      <div className='bg-gray-200'>
        <h1>Live Coding Demo</h1>
        <p>{joke || "Loading..."}</p>
          <AISection />
      </div>
    );
}