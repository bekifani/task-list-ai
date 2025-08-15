import { useState, useEffect } from 'react';
import TaskGenerator from './TaskGenerator';
import TaskList from './TaskList';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load tasks and dark mode preference from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('ai-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load dark mode preference - check localStorage first, then system preference
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      // Apply immediately to prevent flash
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference if no saved preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('ai-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save dark mode preference and apply to document
  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addTasks = (newTasks) => {
    setTasks(prev => [...prev, ...newTasks]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Task Generator
          </h1>
          
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </span>
          </button>
        </div>
        
        <main className="grid gap-12 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Tasks</h2>
              <TaskGenerator onTasksGenerated={addTasks} darkMode={darkMode} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Tasks</h2>
                {tasks.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {tasks.filter(t => t.completed).length} of {tasks.length} completed
                  </span>
                )}
              </div>
              <TaskList 
                tasks={tasks} 
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                darkMode={darkMode}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}