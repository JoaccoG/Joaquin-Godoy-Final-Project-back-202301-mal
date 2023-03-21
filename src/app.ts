import express from 'express';
import cors from 'cors';
import authRouter from './api/auth/auth-router.js';
import apiRouter from './api/api-router.js';
import { appErrorHandler } from './errors/error-handlers.js';
import { authMiddleware } from './api/auth/auth-middleware.js';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

app.get('/', (_req, res) => {
  res.json('Server ON');
});

app.use('/auth', authRouter);
app.use('/auth/validate', authMiddleware, (_req, res) => {
  res.status(200).json({ msg: 'Validated' });
});

app.use('/api/v1', authMiddleware, apiRouter);

app.use(appErrorHandler);

export default app;
