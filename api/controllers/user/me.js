const UserModel = require("../../models/User");
const validation = require("../../validations/user");
class MeController {
	static async userInfo(req, res) {
		try {
			const id = req.payload.id;
			let user = await UserModel.findOne({
				_id: id
			}).select("-hash -salt");
			if (!user) return res.status(404).send("user-not-exists");
			return res.status(200).send(user);
		} catch (error) {
			return res.status(400).send(error);
		}
	}
	static async updateInfo(req, res) {
		try {
			const { avatar, coverimage, birthday, fullname, address, gender } =
				req.body;
			let data = {
				avatar,
				coverimage,
				birthday,
				fullname,
				address,
				gender
			};

			avatar && new URL(avatar);
			coverimage && new URL(coverimage);

			validation.userSave.validateAsync(data);
			typeof gender === "undefined" && (data.gender = null);
			let user = await UserModel.findOneAndUpdate(
				{ _id: req.payload.id },
				data,
				{
					new: true
				}
			).select(["-hash", "-salt"]);

			if (!user) return res.status(404).send({ error: "user-not-found" });
			return res.status(200).send(user);
		} catch (error) {
			return res.status(400).send(error);
		}
	}
}

module.exports = MeController;
