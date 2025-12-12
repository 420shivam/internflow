import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { mockApi } from '../services/mockBackend';
import { geminiService } from '../services/geminiService';
import { Button, Input, Modal, Card } from '../components/ui';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [aiTopic, setAiTopic] = useState('');
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await mockApi.tasks.list(user.id);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async () => {
    if (!currentTask.title || !user) return;
    setLoading(true);
    try {
      if (currentTask.id) {
        await mockApi.tasks.update(currentTask.id, currentTask);
      } else {
        await mockApi.tasks.create({ ...currentTask, userId: user.id } as Task);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      alert('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await mockApi.tasks.delete(id);
      fetchTasks();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleGenerateTasks = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const suggestedTasks = await geminiService.generateTasks(aiTopic);
      // Automatically add them
      for (const t of suggestedTasks) {
        if (user) await mockApi.tasks.create({ ...t, userId: user.id } as Task);
      }
      setIsAiModalOpen(false);
      setAiTopic('');
      fetchTasks();
    } catch (error) {
      alert('Failed to generate tasks. Please check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const openEdit = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setCurrentTask({ status: 'todo', priority: 'medium' });
    setIsModalOpen(true);
  };

  const improveDescription = async () => {
    if (!currentTask.title || !currentTask.description) return;
    setLoading(true);
    try {
      const improved = await geminiService.improveTaskDescription(currentTask.title, currentTask.description);
      setCurrentTask(prev => ({ ...prev, description: improved }));
    } catch (e) {
      alert('AI improvement failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(filter.toLowerCase()) || 
                          t.description.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          {geminiService.isAvailable() && (
            <Button variant="secondary" onClick={() => setIsAiModalOpen(true)}>
              <SparklesIcon className="h-4 w-4 mr-2 text-indigo-500" />
              AI Generate
            </Button>
          )}
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </Card>

      {/* Task Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  task.status === 'done' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {task.status}
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2 truncate" title={task.title}>{task.title}</h3>
              <p className="text-sm text-gray-500 flex-1 mb-4 line-clamp-3">{task.description}</p>
              
              <div className="mt-auto border-t pt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => openEdit(task)} className="text-indigo-600 hover:text-indigo-900">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No tasks found matching your criteria.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentTask.id ? 'Edit Task' : 'Create New Task'}
      >
        <div className="space-y-4">
          <Input 
            label="Title" 
            value={currentTask.title || ''} 
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })} 
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={3}
              value={currentTask.description || ''}
              onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            />
            {geminiService.isAvailable() && (
              <button 
                type="button" 
                onClick={improveDescription}
                disabled={loading || !currentTask.description}
                className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                Improve with AI
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={currentTask.status}
                onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value as any })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={currentTask.priority}
                onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value as any })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask} isLoading={loading}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* AI Modal */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Generate Tasks with AI">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Describe the project or topic you're working on, and our AI will generate a list of starter tasks for you.
          </p>
          <Input 
            label="Project Topic" 
            placeholder="e.g., Build a React Weather App"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <div className="flex justify-end space-x-3 mt-4">
             <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>Close</Button>
             <Button onClick={handleGenerateTasks} isLoading={aiLoading} disabled={!aiTopic}>
               <SparklesIcon className="h-4 w-4 mr-2" />
               Generate
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
