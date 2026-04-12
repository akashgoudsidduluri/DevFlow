# DevFlow - Project Management Application

A full-stack project management application built with React, Node.js, Express, and MongoDB. DevFlow helps teams manage projects, track issues, and collaborate efficiently with a modern kanban board interface.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Project Management**: Create, edit, delete projects and manage team members
- **Issue Tracking**: Create and manage issues with kanban board view
- **Real-time Updates**: Context-based state management for seamless UI updates
- **Responsive Design**: Modern, clean interface that works on all devices

## Tech Stack

### Frontend
- React 19.2.4
- Vite 8.0.4 (build tool)
- React Router (navigation)
- Axios (HTTP client)
- Context API (state management)

### Backend
- Node.js with Express 5.2.1
- MongoDB with Mongoose 9.4.1
- JWT (authentication)
- bcryptjs (password hashing)
- CORS (cross-origin requests)

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas cloud)
  - For local: Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
  - For cloud: Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- **npm** or **yarn** package manager (comes with Node.js)

## Quick Start Guide

**Note:** This project has **three separate package.json files** requiring installation:
- Root directory (shared tooling)
- Backend directory (server dependencies)  
- Frontend directory (React dependencies)

### Step 1: Clone and Navigate to Project
```bash
git clone <repository-url>
cd DevFlow
```

### Step 2: Install Root Dependencies (Optional - for shared tooling like Tailwind CSS)
```bash
npm install
```

### Step 3: Install Backend Dependencies (Required)
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file
# Create a new file named .env in the backend directory
```

**Create `.env` file in `backend/` directory with:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/devflow
JWT_SECRET=your_super_secret_jwt_key_here_change_this
```

**Note:** If using MongoDB Atlas, replace `MONGO_URI` with your connection string.

### Step 4: Install Frontend Dependencies (Required)
```bash
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install
```

### Step 5: Start MongoDB (if using local installation)
```bash
# On Windows (run as Administrator)
net start MongoDB

# Or use MongoDB Compass GUI to start the service
```

### Step 6: Start the Backend Server
```bash
# From the backend directory
cd backend
npm start
```
**Expected Output:** `Server running on port 5000` and `Connected to MongoDB`

### Step 7: Start the Frontend Development Server
```bash
# Open a new terminal and navigate to frontend directory
cd frontend
npm run dev
```
**Expected Output:** `Local: http://localhost:5174/`

### Step 8: Access the Application
1. Open your web browser
2. Navigate to `http://localhost:5174`
3. Register a new account or login
4. Start creating projects and issues!

## Troubleshooting

### Backend won't start:
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Frontend won't load:
- Ensure backend is running on port 5000
- Check for any console errors in browser DevTools
- Try clearing browser cache

### Database connection issues:
- For local MongoDB: Ensure MongoDB service is started
- For MongoDB Atlas: Check network access and connection string

## Development Workflow

1. **Backend changes**: Restart the backend server after code changes
2. **Frontend changes**: Vite hot-reload will automatically update the browser
3. **Database changes**: If you modify models, you may need to restart the backend

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Projects
- `GET /api/projects` - Get all projects for user
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PUT /api/projects/:id/add-member` - Add member to project

### Issues
- `GET /api/issues/project/:projectId` - Get issues for a project
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

## Project Structure

```
DevFlow/
├── backend/
│   ├── BACKEND.md         # Backend API documentation
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   └── issueController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── MODELS.md      # Database schema documentation
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   └── issueRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── FRONTEND.md        # Frontend documentation
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Database Models

The application uses three main MongoDB models:

### User Model
- Stores user authentication information
- Fields: name, email, password (hashed), createdAt
- **Required**: Yes - Essential for authentication and user management

### Project Model
- Represents project entities
- Fields: name, description, owner, members, createdAt
- **Required**: Yes - Core functionality for organizing work

### Issue Model
- Tracks individual tasks/bugs within projects
- Fields: title, description, status, priority, assignee, project, createdAt
- **Required**: Yes - Primary feature for issue tracking and kanban board

All three models are required for the complete functionality of DevFlow.

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Projects**: Add new projects and invite team members
3. **Manage Issues**: Create issues within projects and move them through the kanban board
4. **Track Progress**: Monitor project status and team productivity

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.