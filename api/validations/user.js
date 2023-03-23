const Joi = require("joi");

const userSave = Joi.object({
	avatar: Joi.string().allow(""),
	fullname: Joi.string().min(6).max(100).required().trim(),
	gender: Joi.number(),
	birthday: Joi.string().allow(""),
	address: Joi.string().max(200).allow("")
});

module.exports = {
	userSave
};
