# Database Models

This directory contains the MongoDB/Mongoose schemas that define the data structure for DevFlow.

## Models Overview

### User Model (`User.js`)
**Purpose:** Manages user authentication and profile information.

**Schema Fields:**
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address for login
- `password` (String, required): Hashed password using bcryptjs
- `createdAt` (Date, default: now): Account creation timestamp

**Key Features:**
- Email uniqueness validation
- Password hashing middleware
- JSON transformation to exclude password field

**Usage:**
```javascript
const user = new User({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedpassword"
});
```

### Project Model (`Project.js`)
**Purpose:** Represents project entities that organize work and team collaboration.

**Schema Fields:**
- `name` (String, required): Project title
- `description` (String): Optional project description
- `owner` (ObjectId, ref: 'User', required): Project creator/owner
- `members` (Array of ObjectId, ref: 'User'): Team members with access
- `createdAt` (Date, default: now): Project creation timestamp

**Key Features:**
- Owner validation ensures only project owners can modify
- Members array for team collaboration
- Reference to User model for relationships

**Usage:**
```javascript
const project = new Project({
  name: "DevFlow App",
  description: "Project management application",
  owner: userId,
  members: [userId1, userId2]
});
```

### Issue Model (`Issue.js`)
**Purpose:** Tracks individual tasks, bugs, and work items within projects.

**Schema Fields:**
- `title` (String, required): Issue title/summary
- `description` (String): Detailed issue description
- `status` (String, enum: ['todo', 'in-progress', 'done'], default: 'todo'): Current status
- `priority` (String, enum: ['low', 'medium', 'high'], default: 'medium'): Issue priority level
- `assignee` (ObjectId, ref: 'User'): Assigned team member
- `project` (ObjectId, ref: 'Project', required): Parent project
- `createdAt` (Date, default: now): Issue creation timestamp

**Key Features:**
- Status workflow: todo → in-progress → done
- Priority levels for task management
- Project relationship ensures issues belong to projects
- Assignee tracking for responsibility

**Usage:**
```javascript
const issue = new Issue({
  title: "Implement user authentication",
  description: "Add login/register functionality",
  status: "in-progress",
  priority: "high",
  assignee: userId,
  project: projectId
});
```

## Model Relationships

```
User (1) ──── (M) Project (1) ──── (M) Issue
  │               │                   │
  └─ owner        └─ members          └─ assignee
  └─ members
```

- **User ↔ Project**: Many-to-many relationship (users can own/create multiple projects, projects can have multiple members)
- **Project → Issue**: One-to-many relationship (each project can have multiple issues)
- **User ↔ Issue**: Many-to-many relationship (users can be assigned to multiple issues)

## Schema Validation

All models include:
- **Required field validation**
- **Data type checking**
- **Enum restrictions** for status and priority
- **Reference validation** for ObjectId relationships
- **Unique constraints** (email in User model)

## Middleware

- **User Model**: Password hashing pre-save middleware
- **All Models**: Automatic timestamp creation

## Indexes

- User model: Unique index on email field
- Project model: Index on owner field for efficient queries
- Issue model: Index on project field for issue filtering