const { register } = require("../../validations/auth");

class AuthController {
	static async register(req, res) {
		try {
			await register.validateAsync(req.body);
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
}
module.exports = AuthController;
