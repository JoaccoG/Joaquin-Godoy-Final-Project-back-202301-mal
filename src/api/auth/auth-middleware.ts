import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { CustomHTTPError } from '../../errors/custom-http-error';

export const authMiddleware: RequestHandler = (req, res, next) => {
  const jwtToken = req.headers.authorization?.split(' ')[1];
  if (!jwtToken) {
    throw new CustomHTTPError(401, 'Unauthorized');
  }

  if (!process.env.JWT_SECRET) {
    throw new CustomHTTPError(
      500,
      'JWT_SECRET environment variable is not defined',
    );
  }

  const payload = jwt.verify(
    jwtToken,
    process.env.JWT_SECRET,
  ) as jwt.JwtPayload;

  res.locals.email = payload.email;

  next();
};
