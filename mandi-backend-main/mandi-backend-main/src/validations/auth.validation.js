const Joi = require("joi");

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    email: Joi.string().trim().lowercase().email().required(),

    password: Joi.string().min(8).max(128).required(),

    phoneNumber: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),

    password: Joi.string().required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const resetPasswordSchema = Joi.object({
  body: Joi.object({
    password: Joi.string().min(8).max(128).required(),
  }),
  params: Joi.object({
    token: Joi.string().trim().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema

};
