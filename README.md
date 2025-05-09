# Tasks Management System - Backend Implementation

## Overview
Implemented the backend functionality for **Projects** and **Tasks** management according to the [Spring 2025.pdf](./Spring%202025.pdf) requirements. This includes GraphQL API, authentication, and database models.

## Features Implemented

### Core Functionality
✅ **Projects Management**
- Create projects with title, description, and timelines
- Assign students to projects
- Track project progress (0-100%)

✅ **Tasks Management**  
- Create tasks with status tracking (`PENDING` / `IN_PROGRESS` / `COMPLETED`)
- Assign tasks to students
- Set due dates and descriptions

✅ **Authentication**  
- JWT-based authentication
- Role-based access control (`admin` / `student`)
- Protected GraphQL operations

### Key Endpoints

| Operation             | Type     | Description              | Access  |
|-----------------------|----------|--------------------------|---------|
| `createProject`       | Mutation | Creates new project      | Admin   |
| `getProjectOptions`   | Query    | Lists projects for UI    | Admin   |
| `createTask`          | Mutation | Creates new task         | Admin   |
| `updateProjectProgress` | Mutation | Updates progress %     | Student |

---

## Technical Details

### Schema Definitions

```graphql
# Project Type
type Project {
  id: ID!
  title: String!
  description: String
  startDate: String
  endDate: String
  progress: Int!
  members: [User!]!
}

# Task Type
type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  dueDate: String
}
```

### Database Models

**Project.js**
```javascript
{
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  progress: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}
```

**Task.js**
```javascript
{
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], 
    default: 'PENDING' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: Date
}
```

---

## Setup Instructions

### Environment Variables (`.env`)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_secret
PORT=5000
```

### Install Dependencies
```bash
npm install
```

### Run the Server
```bash
npm start
```

---

## Testing the API

Access GraphQL Playground at:  
[http://localhost:5000/graphql](http://localhost:5000/graphql)

### Example Mutation
```graphql
mutation {
  createTask(
    title: "Implement UI",
    description: "Create responsive layouts",
    projectId: "abc123",
    assignedTo: "stu456"
  ) {
    id
    title
    status
  }
}
```

### Example Query
```graphql
query {
  getProjectOptions {
    id
    title
  }
}
```

---

## File Structure

```
backend/
├── graphql/
│   ├── resolvers.js        # All GraphQL resolvers
│   └── schema.js           # Type definitions
├── models/
│   ├── Project.js          # Project model
│   ├── Task.js             # Task model
│   └── User.js             # User model
├── utils/
│   └── authMiddleware.js   # JWT verification
└── server.js               # Server configuration
```

---

## Contributors
Sami Haji

---

## Documentation
For complete API documentation and additional examples, refer to the GraphQL Schema and Resolvers.
