# DevFlow Backend

The backend API server for DevFlow project management application, built with Node.js, Express, and MongoDB.

## Architecture Overview

This is a RESTful API server that handles:
- User authentication and authorization
- Project management operations
- Issue tracking and kanban board functionality
- Database operations with MongoDB/Mongoose

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── controllers/
│   ├── userController.js  # User authentication logic
│   ├── projectController.js # Project CRUD operations
│   ├── issueController.js # Issue management logic
├── middleware/
│   ├── authMiddleware.js  # JWT authentication middleware
│   └── errorMiddleware.js # Error handling middleware
├── models/
│   ├── User.js           # User schema
│   ├── Project.js        # Project schema
│   └── Issue.js          # Issue schema
├── routes/
│   ├── userRoutes.js     # Authentication endpoints
│   ├── projectRoutes.js  # Project endpoints
│   ├── issueRoutes.js    # Issue endpoints
├── utils/
│   └── generateToken.js  # JWT token generation
├── server.js             # Main server file
└── package.json          # Dependencies
```

## Key Dependencies

### Core Framework
- **express** (^5.2.1): Web framework for API routes and middleware
- **mongoose** (^9.4.1): MongoDB object modeling

### Authentication & Security
- **jsonwebtoken** (^9.0.3): JWT token handling
- **bcryptjs** (^3.0.3): Password hashing
- **cookie-parser** (^1.4.7): HTTP cookie parsing

### Utilities
- **cors** (^2.8.6): Cross-origin resource sharing
- **dotenv** (^17.4.0): Environment variable management

### Optional (Not Currently Used)
- **nodemailer** (^8.0.5): Email sending (for future features)
- **socket.io** (^4.8.3): Real-time communication (for future features)

## Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devflow
JWT_SECRET=your_super_secret_jwt_key_here_change_this
```

## API Endpoints

### Authentication Routes (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)

### Project Routes (`/api/projects`)
- `GET /` - Get all user projects
- `GET /:id` - Get project by ID
- `POST /` - Create new project
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project
- `PUT /:id/add-member` - Add team member

### Issue Routes (`/api/issues`)
- `GET /project/:projectId` - Get issues for a project
- `POST /` - Create new issue
- `PUT /:id` - Update issue
- `DELETE /:id` - Delete issue

## Authentication Flow

1. **Registration**: User provides name, email, password
2. **Password Hashing**: bcryptjs hashes password before storage
3. **JWT Generation**: Upon successful login, JWT token created
4. **Token Storage**: Token stored in HttpOnly cookie
5. **Middleware Verification**: Protected routes verify JWT token

## Database Design

See `models/README.md` for detailed schema information.

### Key Relationships:
- Users can own multiple projects and be members of multiple projects
- Projects contain multiple issues
- Issues are assigned to users within project context

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **HttpOnly Cookies**: Secure token storage
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Mongoose schema validation

## Running the Backend

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:5000`

## Development Notes

- Uses ES6 modules (`"type": "module"` in package.json)
- Error handling middleware for consistent error responses
- Authentication middleware protects sensitive routes
- Database connection established on server start