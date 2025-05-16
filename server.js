const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const express = require('express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require('mongoose');
require('dotenv').config();

// Import GraphQL schema and resolvers
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const httpServer = createServer(app);

// Create executable schema
const schema = makeExecutableSchema({ 
  typeDefs,
  resolvers
});

// Configure Apollo Server
const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => ({
    token: req.headers.authorization || ''
  })
});

async function startServer() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB Connected');

  // Start Apollo Server
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  // Configure WebSocket subscriptions
  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: apolloServer.graphqlPath }
  );

  // Start HTTP server
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error('❌ Server startup error:', err.message);
  process.exit(1);
});

// const express = require('express');
// const { ApolloServer } = require('apollo-server-express');
// const mongoose = require('mongoose');
// require('dotenv').config();

// // GraphQL schema and resolvers (سننشئهم لاحقًا)
// const { typeDefs } = require('./graphql/schema');
// const { resolvers } = require('./graphql/resolvers');

// // تهيئة Express
// const app = express();

// // إعداد Apollo Server
// async function startServer() {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: ({ req }) => {
//       const token = req.headers.authorization || '';
//       return { token };
//     }
//   });

//   await server.start();
//   server.applyMiddleware({ app });

//   // الاتصال بقاعدة البيانات
//   mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }).then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

//   // بدء السيرفر
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
//   });
// }

// startServer();
