import { Joi } from 'express-validation';

export const postValidation = {
  body: Joi.object({
    game: Joi.string().required(),
    review: Joi.string().max(240).required(),
    rating: Joi.number().required(),
  }),
};
