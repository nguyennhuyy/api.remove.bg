const UserModel = require("../../models/User");

class MeController {
	static async userInfo(req, res) {
		const id = req.payload.id;
		let user = await UserModel.findOne({
			_id: id
		}).select("-hash -salt");
		if (!user) return res.status(404).send("user-not-exists");
		return res.status(200).send(user);
	}
}

module.exports = MeController;
