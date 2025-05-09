const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

// GraphQL schema and resolvers (سننشئهم لاحقًا)
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

// تهيئة Express
const app = express();

// إعداد Apollo Server
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  // الاتصال بقاعدة البيانات
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

  // بدء السيرفر
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
