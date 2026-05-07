# 📋 Task Manager - Project Management System

A complete task and project management application for teams to collaborate efficiently.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT token based authentication
- Password encryption with bcrypt
- Protected routes

### 📁 Project Management
- Create, read, update, delete projects
- Track project progress automatically
- View project statistics (total tasks, completed tasks)

### ✅ Task Management
- Create tasks with title, description, priority, due date
- Update task status (TODO, IN_PROGRESS, COMPLETED)
- Delete tasks
- Priority levels: LOW, MEDIUM, HIGH

### 📊 Dashboard
- Overview of all projects and tasks
- Statistics cards (total projects, total tasks, completed, overdue)
- Recent tasks list
- Progress tracking

### 🎨 User Interface
- Responsive design for mobile and desktop
- Clean and modern interface with Tailwind CSS
- Loading states
- Error handling with user feedback

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| React 18 | UI library |
| Tailwind CSS | Styling |
| Axios | API calls |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| JWT | Authentication |
| bcrypt | Password hashing |

## 📦 Installation Guide

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Any modern browser (Chrome, Firefox, Edge)

### Step 1: Download the Project

```bash
# Extract the downloaded zip file to your Desktop
# Or clone using git
git clone <your-repo-url>
cd my-task-app
