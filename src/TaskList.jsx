import { useState } from 'react';
import axios from 'axios';

export default function TaskList({ tasks, onUpdateTask, onDeleteTask, darkMode }) {
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [webhookUrl] = useState('https://webhook.site/unique-id'); // Replace with actual webhook URL
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const sendWebhook = async (task) => {
    try {
      const payload = {
        taskId: task.id,
        taskName: task.name,
        taskDescription: task.description,
        timeframe: task.timeframe,
        completedAt: new Date().toISOString(),
        action: 'task_completed'
      };

      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      showNotification(`Task "${task.name}" completion sent to webhook`, 'success');
    } catch (error) {
      console.error('Webhook error:', error);
      showNotification(`Failed to send webhook for "${task.name}"`, 'error');
    }
  };

  const handleToggleComplete = async (task) => {
    const newCompletedStatus = !task.completed;
    onUpdateTask(task.id, { completed: newCompletedStatus });
    
    // Send webhook only when marking as complete
    if (newCompletedStatus) {
      await sendWebhook({ ...task, completed: newCompletedStatus });
    }
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditForm({ name: task.name, description: task.description });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditForm({ name: '', description: '' });
  };

  const saveEdit = () => {
    if (editForm.name.trim() && editForm.description.trim()) {
      onUpdateTask(editingTask, {
        name: editForm.name.trim(),
        description: editForm.description.trim()
      });
      cancelEditing();
      showNotification('Task updated successfully', 'success');
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg flex justify-between items-center transition-all duration-200 ${
                notification.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-400 dark:border-green-600' :
                notification.type === 'error' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-400 dark:border-red-600' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-400 dark:border-blue-600'
              }`}
            >
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Generate some tasks to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                task.completed 
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:shadow-md dark:hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                
                <div className="flex-1">
                  {editingTask === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Task name"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        rows={3}
                        placeholder="Task description"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold text-lg ${
                          task.completed 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.name}
                        </h3>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => startEditing(task)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm p-1 rounded transition-colors duration-200"
                            title="Edit task"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm p-1 rounded transition-colors duration-200"
                            title="Delete task"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-2 leading-relaxed ${
                        task.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {task.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          task.completed 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' 
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                        }`}>
                          ⏱️ {task.timeframe}
                        </span>
                        {task.completed && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✅ Completed
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}