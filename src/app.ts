import express from 'express';
import cors from 'cors';
import authRouter from './api/auth/auth-router.js';
import apiRouter from './api/api-router.js';
import { appErrorHandler } from './errors/error-handlers.js';
import { authMiddleware } from './api/auth/auth-middleware.js';
import bodyParser from 'body-parser';

const app = express();

app.get('/', (_req, res) => {
  res.json('Server ON');
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.disable('x-powered-by');

app.use('/auth', authRouter);
app.use('/api/v1', authMiddleware, apiRouter);

app.use(appErrorHandler);

export default app;
