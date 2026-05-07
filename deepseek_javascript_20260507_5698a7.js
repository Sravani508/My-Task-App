const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Temporary database (in memory)
let users = [];
let projects = [];
let tasks = [];
let nextId = 1;

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// ========== AUTHENTICATION ==========

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: nextId++,
    name,
    email,
    password: hashedPassword,
    role: 'MEMBER',
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: 'Registration successful',
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token
  });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
});

// Middleware to verify token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Get current user
app.get('/api/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

// ========== PROJECTS ==========

// Get all projects
app.get('/api/projects', authMiddleware, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.userId);
  
  const projectsWithStats = userProjects.map(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const completed = projectTasks.filter(t => t.status === 'COMPLETED').length;
    return {
      ...p,
      totalTasks: projectTasks.length,
      completedTasks: completed,
      progress: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
    };
  });
  
  res.json(projectsWithStats);
});

// Create project
app.post('/api/projects', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  
  const newProject = {
    id: nextId++,
    name,
    description: description || '',
    userId: req.userId,
    createdAt: new Date()
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

// Update project
app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const projectId = parseInt(req.params.id);
  const { name, description } = req.body;
  
  const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === req.userId);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    name: name || projects[projectIndex].name,
    description: description !== undefined ? description : projects[projectIndex].description
  };
  
  res.json(projects[projectIndex]);
});

// Delete project
app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const projectId = parseInt(req.params.id);
  
  const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === req.userId);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects.splice(projectIndex, 1);
  tasks = tasks.filter(t => t.projectId !== projectId);
  
  res.json({ message: 'Project deleted' });
});

// ========== TASKS ==========

// Get tasks for a project
app.get('/api/tasks', authMiddleware, (req, res) => {
  const { projectId } = req.query;
  
  let userTasks = tasks.filter(t => {
    const project = projects.find(p => p.id === t.projectId);
    return project && project.userId === req.userId;
  });
  
  if (projectId) {
    userTasks = userTasks.filter(t => t.projectId === parseInt(projectId));
  }
  
  res.json(userTasks);
});

// Create task
app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, status, priority, dueDate, projectId } = req.body;
  
  const project = projects.find(p => p.id === projectId && p.userId === req.userId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const newTask = {
    id: nextId++,
    title,
    description: description || '',
    status: status || 'TODO',
    priority: priority || 'MEDIUM',
    dueDate: dueDate || null,
    projectId,
    createdAt: new Date()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, status, priority, dueDate } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = tasks[taskIndex];
  const project = projects.find(p => p.id === task.projectId);
  
  if (!project || project.userId !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  tasks[taskIndex] = {
    ...task,
    title: title || task.title,
    description: description !== undefined ? description : task.description,
    status: status || task.status,
    priority: priority || task.priority,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate
  };
  
  res.json(tasks[taskIndex]);
});

// Delete task
app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = tasks[taskIndex];
  const project = projects.find(p => p.id === task.projectId);
  
  if (!project || project.userId !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted' });
});

// ========== DASHBOARD ==========

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.userId);
  const userTasks = tasks.filter(t => {
    const project = projects.find(p => p.id === t.projectId);
    return project && project.userId === req.userId;
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = {
    totalProjects: userProjects.length,
    totalTasks: userTasks.length,
    completedTasks: userTasks.filter(t => t.status === 'COMPLETED').length,
    pendingTasks: userTasks.filter(t => t.status !== 'COMPLETED').length,
    overdueTasks: userTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'COMPLETED').length
  };
  
  const recentTasks = [...userTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  
  res.json({ stats, recentTasks });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});