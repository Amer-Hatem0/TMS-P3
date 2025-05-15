// 📁 src/graphql/typeDefs.js
import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    role: String!
    universityId: String
  }

  type Project {
    _id: ID!
    name: String!
    description: String
    startDate: String
    endDate: String
    createdBy: User!
    students: [User!]!
  }

  type Task {
    _id: ID!
    title: String!
    description: String
    status: String!
    assignedTo: User!
    project: Project!
    dueDate: String
  }


  type TaskStats {
    assigned: Int!
    completed: Int!
    pending: Int!
  }

type Chat {
  id: ID!
  sender: User!
  receiver: User!
  message: String!
  timestamp: String!
  read: Boolean!
}

  type Query {
    users: [User!]!
    projects: [Project!]!
    tasks: [Task!]!
    studentTaskStats(id: ID!): TaskStats
    getChatHistory(receiverId: ID!): [Chat!]! @auth
    getMyTasks: [Task!]! @auth(requires: STUDENT)
    getTask(id: ID!): Task @auth


  }

  type Mutation {
    createProject(name: String!, description: String, createdBy: ID!, students: [ID!]!): Project!
    createTask(title: String!, description: String, assignedTo: ID!, project: ID!, dueDate: String): Task!
    sendMessage(receiverId: ID!, message: String!): Chat! @auth

  }



`;

export default typeDefs;
