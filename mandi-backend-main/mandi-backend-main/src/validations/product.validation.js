const Joi = require("joi");

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Must be a valid MongoDB ObjectId",
  });

const createProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),

    description: Joi.string().trim().max(2000).required(),

    price: Joi.number().min(0).required(),

    stock: Joi.number().integer().min(0).required(),

    category: objectId.required(),

    isActive: Joi.boolean().optional(),

    // For JSON requests only.
    // Uploaded files are handled by multer.
    images: Joi.array().items(Joi.string().trim()).optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const updateProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).optional(),

    description: Joi.string().trim().max(2000).optional(),

    price: Joi.number().min(0).optional(),

    stock: Joi.number().integer().min(0).optional(),

    category: objectId.optional(),

    isActive: Joi.boolean().optional(),

    images: Joi.array().items(Joi.string().trim()).optional(),
  }).min(1),

  params: Joi.object({
    id: objectId.required(),
  }),

  query: Joi.object(),
});

const productIdSchema = Joi.object({
  body: Joi.object(),

  params: Joi.object({
    id: objectId.required(),
  }),

  query: Joi.object(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
};