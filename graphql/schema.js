const { gql } = require('apollo-server-express');

const typeDefs = gql`
  directive @auth(requires: String) on FIELD_DEFINITION

  enum Role {
    ADMIN
    STUDENT
  }
    
  type User {
    id: ID!
    username: String!
    role: String!
    universityId: String
  }

  type Project {
    id: ID!
    title: String!
    description: String
    startDate: String  
    endDate: String    
    createdBy: User!
    members: [User!]!
    createdAt: String!
    updatedAt: String!
  }
  
  type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  assignedTo: User!
  project: Project!
  dueDate: String
  }
  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  type AuthPayload {
    token: String!
    user: User!
    redirectUrl: String!
  }
type DashboardStats {
  projects: Int
  students: Int
  tasks: Int
  finishedProjects: Int
}

type Query {
    # Dashboard
    dashboardStats: DashboardStats
    
    # Auth
    me: User
    
    # Projects
    getProjects: [Project!]! @auth(requires: ADMIN)
    getProject(id: ID!): Project @auth(requires: ADMIN)
    getMyProjects: [Project!]! @auth(requires: STUDENT)
    
    # Tasks
    getProjectTasks(projectId: ID!): [Task!]! @auth(requires: ADMIN)
    getMyTasks: [Task!]! @auth(requires: STUDENT)

    getProjectOptions: [Project!]! @auth(requires: ADMIN)  # For project dropdown
    getStudentOptions: [User!]! @auth(requires: ADMIN)     # For student dropdown

  }

  type Mutation {
    signUp(
      username: String!
      password: String!
      role: String!
      universityId: String
    ): AuthPayload!

    login(
      username: String!
      password: String!
    ): AuthPayload!

    # Projects
    # Admin only
    createProject(
      title: String!
      description: String
      startDate: String  # Added
      endDate: String    # Added
      memberIds: [ID!]!  # Student IDs
    ): Project! @auth(requires: ADMIN)

    # Student actions
    updateProjectProgress(
      projectId: ID!
      progress: Int!  # 0-100 percentage
    ): Project! @auth(requires: STUDENT)

    # Tasks
    createTask(
    title: String!
    description: String  # Added
    projectId: ID!
    assignedTo: ID!
    status: TaskStatus   # Added (optional, defaults to PENDING)
    dueDate: String
  ): Task! @auth(requires: ADMIN)
  }
`;

module.exports = { typeDefs };
