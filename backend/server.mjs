// server.mjs
import './db/connect.js'; // connect mongoose
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
// Trust the hosting proxy (e.g. Render) so req.ip reflects the real client for rate limiting.
app.set('trust proxy', 1);

const devOrigins = ['http://localhost:8081', 'http://localhost:19006'];
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const originList = configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === 'production'
    ? []
    : devOrigins;

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no Origin (native apps, curl, server-to-server) and allowlisted browser origins.
    if (!origin || originList.includes(origin)) {
      return cb(null, true);
    }
    return cb(null, false);
  },
};

app.use(cors(corsOptions), express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: [{ message: 'Too many login attempts, try again later.' }] },
});

app.use('/graphql', (req, res, next) => {
  const query = req.body?.query || '';
  const isLogin = req.body?.operationName === 'Login' || /\blogin\s*\(/.test(query);
  return isLogin ? loginLimiter(req, res, next) : next();
});

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      const devBypass = process.env.DEV_ALLOW_UNAUTH === 'true';
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
      return { orgId };
    },
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 GraphQL on http://localhost:${PORT}/graphql`));
