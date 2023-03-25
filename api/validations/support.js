const Joi = require("joi");

const supportValidate = Joi.object({
	email: Joi.string()
		.regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
		.required(),
	subject: Joi.string().min(6).max(100).required().trim(),
	message: Joi.string().min(6).max(600).required().trim()
});

module.exports = {
	supportValidate
};
