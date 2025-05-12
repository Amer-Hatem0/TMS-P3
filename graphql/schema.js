const { gql } = require('apollo-server-express');

const typeDefs = gql`
  directive @auth(requires: String) on FIELD_DEFINITION

  enum Role {
    admin
    student
  }

  enum ProjectStatus {
    IN_PROGRESS
    COMPLETED
    PENDING
    ON_HOLD
    CANCELLED
  }

  enum TaskStatus {
    IN_PROGRESS
    COMPLETED
    PENDING
    ON_HOLD
    CANCELLED
  }
    
  type User {
    id: ID!
    username: String!
    role: String!
    universityId: String
  }

  type Category {
  id: ID!
  name: String!
  createdAt: String!
}

  type Project {
    id: ID!
    title: String!
    description: String
    category: Category!
    status: ProjectStatus!
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
    projectTitle: String!
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

    getAllCategories: [Category!]!

    # Dashboard
    dashboardStats: DashboardStats
    
    # Auth
    me: User
    
    # Projects
    getProjects: [Project!]! @auth(requires: admin)
    getProject(id: ID!): Project @auth(requires: admin)
    getMyProjects: [Project!]! @auth(requires: student)
    # Tasks
    getProjectTasks(projectId: ID!): [Task!]! @auth(requires: admin)
    getMyTasks: [Task!]! @auth(requires: student)

    getProjectOptions: [Project!]! @auth(requires: admin)  # For project dropdown
    getStudentOptions: [User!]! @auth(requires: admin)     # For student dropdown

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
    createCategory(name: String!): Category! @auth(requires: admin)
    createProject(
      title: String!
      description: String
      categoryName: String!
      status: ProjectStatus!
      startDate: String
      endDate: String
      memberUsernames: [String!]!  # Changed to accept usernames
    ): Project! @auth(requires: admin)

    # Student actions
    updateProjectProgress(
      projectId: ID!
      progress: Int!  # 0-100 percentage
    ): Project! @auth(requires: student)

    # Tasks
    createTask(
      title: String!
      description: String
      projectTitle: String!  # Changed to accept title
    assignedToUsername: String!  # Changed to accept username
      status: TaskStatus
      dueDate: String
    ): Task! @auth(requires: admin)
  }
`;

module.exports = { typeDefs };
