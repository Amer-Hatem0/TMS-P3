const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    role: String!
    universityId: String
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
  dashboardStats: DashboardStats
}

  type Query {
    me: User
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
  }
`;

module.exports = { typeDefs };
