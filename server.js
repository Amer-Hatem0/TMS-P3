const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();
const { makeExecutableSchema } = require('@graphql-tools/schema');
const authDirective  = require('./graphql/auth');

// GraphQL schema and resolvers
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

// تهيئة Express
const app = express();

// Create schema with auth directive
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apply the directive transformer
const schemaWithDirectives = authDirective(schema).auth.transformer(schema);

// إعداد Apollo Server
async function startServer() {
  const server = new ApolloServer({
    schema: schemaWithDirectives, // Use the executable schema instead of raw typeDefs and resolvers
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      try {
        const user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        return { user };
      } catch (err) {
        return { user: null };
      }
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  // الاتصال بقاعدة البيانات (updated connection without deprecated options)
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

  // بدء السيرفر
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();