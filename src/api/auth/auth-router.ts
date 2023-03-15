import express from 'express';
import { validate } from 'express-validation';
import { errorHandler } from '../../errors/error-handlers.js';
import { loginController, registerController } from './auth-controllers.js';
import { authValidation } from './auth-validations.js';

const authRouter = express.Router();

authRouter.use(validate(authValidation));

authRouter.route('/register').post(errorHandler, registerController);
authRouter.route('/login').post(errorHandler, loginController);

export default authRouter;
