'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.stats);
      setRecentTasks(res.data.recentTasks);
    } catch (error) {
      console.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 mb-2">Total Projects</div>
          <div className="text-3xl font-bold">{stats?.totalProjects || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 mb-2">Total Tasks</div>
          <div className="text-3xl font-bold">{stats?.totalTasks || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-600">{stats?.completedTasks || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 mb-2">Overdue</div>
          <div className="text-3xl font-bold text-red-600">{stats?.overdueTasks || 0}</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet. Create a project and add tasks!</p>
        ) : (
          recentTasks.map((task) => (
            <div key={task.id} className="border-b py-3">
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-gray-500">
                Status: {task.status} | Priority: {task.priority}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}