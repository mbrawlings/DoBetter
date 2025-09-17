// server.mjs
import './db/connect.js'; // connect mongoose
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors(), express.json());

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      const devBypass = process.env.DEV_ALLOW_UNAUTH === 'true' || !process.env.JWT_SECRET;
      const token = req.headers.authorization?.replace('Bearer ', '');
      let orgId = null;
      if (token && process.env.JWT_SECRET) {
        try {
          orgId = jwt.verify(token, process.env.JWT_SECRET).orgId;
        } catch {}
      }
      if (!orgId && devBypass) {
        orgId = '000000000000000000000000';
      }
      if (!orgId) {
        throw new Error('Unauthorized');
      }
      return { orgId };
    },
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 GraphQL on http://localhost:${PORT}/graphql`));
