const authDirective = require('./graphql/auth');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const websocket = require('./websocket');
const mongoose = require('mongoose');
require('dotenv').config();

async function startServer() {
  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  const app = express();
  const httpServer = http.createServer(app);

  // Setup WebSocket
  websocket(httpServer);

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
    schemaDirectives: {
      auth: authDirective.auth
    }
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply middleware
  apolloServer.applyMiddleware({ app });

  // Start HTTP server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
});