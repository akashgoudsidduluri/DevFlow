# DevFlow Frontend

The React frontend for DevFlow project management application, built with modern React hooks and Vite.

## Overview

This is a single-page application (SPA) that provides:
- User authentication interface
- Project management dashboard
- Issue tracking with kanban board
- Responsive design for all devices

## Tech Stack

- **React 19.2.4**: Modern React with hooks
- **Vite 8.0.4**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: Global state management
- **ESLint**: Code linting

## Project Structure

```
frontend/
├── public/
│   └── vite.svg          # Vite logo
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.jsx    # Navigation bar
│   │   ├── CreateProjectForm.jsx
│   │   ├── CreateIssueForm.jsx
│   │   └── IssueCard.jsx
│   ├── context/          # React Context for state management
│   │   ├── AuthContext.jsx   # User authentication state
│   │   ├── ProjectContext.jsx # Project operations
│   │   └── IssueContext.jsx   # Issue management
│   ├── pages/            # Main application pages
│   │   ├── Dashboard.jsx     # Project overview
│   │   ├── ProjectDetails.jsx # Individual project view
│   │   ├── IssueBoard.jsx     # Kanban board
│   │   ├── LoginForm.jsx      # Login page
│   │   ├── RegisterForm.jsx   # Registration page
│   │   └── ...
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
└── README.md
```

## Key Components

### Context Providers
- **AuthContext**: Manages user login/logout state
- **ProjectContext**: Handles project CRUD operations
- **IssueContext**: Manages issue creation and updates

### Main Pages
- **Dashboard**: Lists all user projects
- **ProjectDetails**: Shows project info and team members
- **IssueBoard**: Kanban board with drag-and-drop (planned)
- **Login/Register**: Authentication forms

## State Management

Uses React Context API for global state:

```javascript
// AuthContext provides:
const { user, login, register, logout, loading } = useAuth();

// ProjectContext provides:
const { projects, createProject, updateProject, deleteProject } = useProject();

// IssueContext provides:
const { issues, createIssue, updateIssue, deleteIssue } = useIssue();
```

## API Integration

- **Axios** for HTTP requests to backend API
- **Credentials included** for cookie-based authentication
- **Error handling** with user-friendly messages
- **Loading states** for better UX

## Routing

```javascript
// Protected routes require authentication
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

// Public routes
<Route path="/login" element={<LoginForm />} />
<Route path="/register" element={<RegisterForm />} />
```

## Development

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5174` with hot reload.

## Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory.

## Key Features Implemented

- ✅ User registration and login
- ✅ Project creation, editing, deletion
- ✅ Team member management
- ✅ Issue creation and status updates
- ✅ Kanban board display
- ✅ Responsive design
- ✅ Context-based state management
- ✅ Protected routes
- ✅ Error handling and loading states

## Future Enhancements

- 🔄 Drag-and-drop for kanban board
- 🎨 Enhanced UI styling
- 📱 Mobile optimization
- 🔔 Real-time notifications
- 📊 Project analytics

## Development Notes

- Uses modern React hooks (useState, useEffect, useCallback)
- Context functions wrapped in useCallback to prevent infinite re-renders
- Axios interceptors for consistent API error handling
- ESLint for code quality
- Vite for fast development and optimized builds
