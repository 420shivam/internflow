import { User, Task, AuthResponse } from '../types';

// Constants for LocalStorage keys
const USERS_KEY = 'app_users';
const TASKS_KEY = 'app_tasks';
const CURRENT_USER_KEY = 'app_current_user_token';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Initialization
const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    const initialTasks: Task[] = [
      { id: '1', title: 'Complete Frontend Assignment', description: 'Implement React Dashboard with Auth', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString(), userId: 'demo' },
      { id: '2', title: 'Learn Gemini API', description: 'Read documentation and implement a basic prompt', status: 'todo', priority: 'medium', createdAt: new Date().toISOString(), userId: 'demo' },
    ];
    localStorage.setItem(TASKS_KEY, JSON.stringify(initialTasks));
  }
};

initializeData();

export const mockApi = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(800); // Simulate network
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      // For demo purposes, allow a default demo user if not found
      if (!user && email === 'demo@example.com' && password === 'password') {
        const demoUser: User = { id: 'demo', name: 'Demo Intern', email: 'demo@example.com', role: 'intern' };
        return { user: demoUser, token: 'mock-jwt-token-demo' };
      }

      if (!user) throw new Error('Invalid credentials');
      
      const { password: _, ...safeUser } = user;
      return { user: safeUser as User, token: `mock-jwt-token-${user.id}` };
    },
    
    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
      await delay(1000);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.find((u: any) => u.email === email)) {
        throw new Error('User already exists');
      }
      
      const newUser = { id: Math.random().toString(36).substr(2, 9), name, email, password, role: 'intern' };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const { password: _, ...safeUser } = newUser;
      return { user: safeUser as User, token: `mock-jwt-token-${newUser.id}` };
    },

    me: async (token: string): Promise<User> => {
      await delay(400);
      if (token === 'mock-jwt-token-demo') {
        return { id: 'demo', name: 'Demo Intern', email: 'demo@example.com', role: 'intern' };
      }
      const userId = token.split('mock-jwt-token-')[1];
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find((u: any) => u.id === userId);
      if (!user) throw new Error('Unauthorized');
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    }
  },

  tasks: {
    list: async (userId: string): Promise<Task[]> => {
      await delay(500);
      const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      // In a real app, we filter by userId. For the demo user, we show their tasks.
      // If the user is just created, they might see empty or we can give them default tasks.
      return tasks.filter((t: Task) => t.userId === userId || userId === 'demo'); 
    },

    create: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
      await delay(600);
      const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
      tasks.push(newTask);
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return newTask;
    },

    update: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
      await delay(400);
      const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      const index = tasks.findIndex((t: Task) => t.id === taskId);
      if (index === -1) throw new Error('Task not found');
      
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return tasks[index];
    },

    delete: async (taskId: string): Promise<void> => {
      await delay(400);
      let tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      tasks = tasks.filter((t: Task) => t.id !== taskId);
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }
};
