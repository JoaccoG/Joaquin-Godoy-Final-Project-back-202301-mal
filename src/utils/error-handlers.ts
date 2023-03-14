import { NextFunction, Request, Response } from 'express';
import log from '../logger.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  log.error(err);
  return res.status(500).json(err);
};
