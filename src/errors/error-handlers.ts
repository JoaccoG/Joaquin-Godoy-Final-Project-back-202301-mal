import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import log from '../logger.js';
import { CustomHTTPError } from './custom-http-error.js';

export const appErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res
      .status(err.statusCode)
      .json({ msg: err.details.body?.[0].message ?? err.message });
  }

  if (err instanceof CustomHTTPError) {
    log.error(err);
    return res.status(err.httpCode).json(err.toBodyJSON());
  }

  log.error(err);
  res.status(500).json({ msg: err.message });
};
