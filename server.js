const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();
const { makeExecutableSchema } = require('@graphql-tools/schema');
const jwt = require('jsonwebtoken');
const authDirective = require('./graphql/auth');
const cors = require('cors');

// GraphQL schema and resolvers
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

// Initialize Express
const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create schema with auth directive
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apply the directive transformer
const schemaWithDirectives = authDirective(schema).auth.transformer(schema);

// Authentication middleware
const getAuthenticatedUser = (token) => {
  if (!token) return null;
  
  try {
    return jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return null;
  }
};

// Setup Apollo Server
async function startServer() {
  const server = new ApolloServer({
    schema: schemaWithDirectives,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getAuthenticatedUser(token);
      return { user };
    },
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      return err;
    }
  });

  await server.start();
  server.applyMiddleware({ 
    app,
    cors: false // We already handle CORS via express
  });

  // Database connection
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();