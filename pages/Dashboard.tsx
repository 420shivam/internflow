import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { mockApi } from '../services/mockBackend';
import { Card } from '../components/ui';
import { 
  ChartPieIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const data = await mockApi.tasks.list(user.id);
        setTasks(data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (isLoading) return <div className="flex h-full items-center justify-center">Loading stats...</div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  const stats = [
    { name: 'Total Tasks', value: totalTasks, icon: ChartPieIcon, color: 'bg-blue-500' },
    { name: 'Completed', value: completedTasks, icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'In Progress', value: inProgressTasks, icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Pending', value: pendingTasks, icon: ExclamationCircleIcon, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening with your projects today.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link to="/tasks">
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Manage Tasks
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Activity</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks found. Get started by creating one!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="truncate text-sm text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        task.status === 'done' ? 'bg-green-100 text-green-800' : 
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        
        <div className="bg-indigo-700 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Intern Assignment Status</h3>
          <p className="mb-4 opacity-90">
            You are currently working on the "Frontend + Backend" assignment. 
            Remember to check your API integration and ensure responsive design.
          </p>
          <div className="w-full bg-indigo-900 rounded-full h-2.5 mb-2">
            <div className="bg-indigo-300 h-2.5 rounded-full" style={{ width: `${(completedTasks / (totalTasks || 1)) * 100}%` }}></div>
          </div>
          <p className="text-sm opacity-75">{completedTasks} of {totalTasks} tasks completed</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
