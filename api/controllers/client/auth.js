const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { register, login } = require("../../validations/auth");
const UserModel = require("../../models/User");
const Fetch = require("../../../plugins/fetch");
class AuthController {
	static async register(req, res) {
		try {
			if (req.body.affiliate && req.body.affiliate.trim()) {
				let user = await UserModel.findOne({
					email: req.body.affiliate.trim().toLowerCase()
				});
				if (
					!user ||
					req.body.affiliate.trim().toLowerCase() ===
						req.body.email.trim().toLowerCase()
				)
					return res.status(404).send({ error: "referral-code-not-found" });
				req.body.affiliate = user._id.toString();
			}
			await register.validateAsync(req.body);
			let user_exits = await UserModel.findOne({
				email: req.body.email.trim().toLowerCase()
			});
			if (user_exits) return res.status(422).send({ error: "email-exits" });

			let language = await LanguageModel.findOne({ locale: "vi" });
			req.body.language = language._id;
			let user_model = new UserModel(req.body);
			user_model.setPassword(req.body.password);
			return user_model
				.save()
				.then(async user => {
					return res
						.status(200)
						.send({ fullname: req.body.fullname, email: req.body.email });
				})
				.catch(error => {
					return res.status(422).send({ error: "email-exits" });
				});
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
	static async login(req, res) {
		try {
			await login.validateAsync(req.body);
			let setting = await SettingModel.findOne({});
			let user = await UserModel.findOne({
				email: req.body.email.trim().toLowerCase()
			}).populate(["professions.profession_id"]);
			if (!user || user.status === "close")
				return res.status(404).send({ error: "user-not-found" });

			if (!user.validatePassword(req.body.password))
				return res.status(400).send({
					error: "user-incorrect-password"
				});

			let token = await AuthController.generateToken(
				{ id: user._id, email: user.email },
				req.body.remember
			);
			let data = user.jsonData();
			data.token = token;
			data.need_otp = setting.need_otp;

			return res.status(200).send(data);
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
	static async loginFacebook(req, res) {
		let { access_token } = req.body;
		if (!access_token)
			return res.status(422).send({
				error: "access-token-is-require"
			});
		try {
			let setting = await SettingModel.findOne({});
			let data_facebook = await Fetch.get({
				path: `https://graph.facebook.com/me?fields=email,name,picture&access_token=${access_token}`
			});
			if (!data_facebook.id)
				return res.status(422).send({
					error: "facebook-login-failed"
				});
			let user = await UserModel.findOne({
				$or: [
					{ email: data_facebook.email },
					{ uid: data_facebook.id, type_login: "facebook" }
				]
			});
			let first_login = !user;
			if (!user) {
				let user_data = {
					email: data_facebook.email || `${data_facebook.id}@gmail.com`,
					password: data_facebook.id,
					fullname: data_facebook.name,
					avatar: `https://graph.facebook.com/${data_facebook.id}/picture?type=large&redirect=true&width=300&height=300`,
					type_login: "facebook",
					uid: data_facebook.id
				};

				let language = await LanguageModel.findOne({ locale: "vi" });
				user_data.language = language._id;
				let new_user = new UserModel(user_data);
				new_user.setPassword(user_data.password);
				user = await new_user.save();

				if (user.email && setting.send_mail) {
					let emailModule = new EmailModule(
						"register_account",
						"vi",
						user_data.email
					);
					await emailModule.send_email({
						full_name: user_data.fullname,
						email: user_data.email
					});
				}
			} else {
				let data_update = {};
				!user.uid && (data_update.uid = data_facebook.user);
				user.type_login !== "facebook" && (data_update.type_login = "facebook");
				if (Object.keys(data_update).length > 0)
					await UserModel.findOneAndUpdate(
						{
							_id: user._id
						},
						data_update
					);
			}
			let token = await AuthController.generateToken({
				id: user._id,
				email: user.email,
				uid: user.uid
			});
			let data = user.jsonData();
			data.token = token;
			data.first_login = first_login;
			data.need_otp = setting.need_otp;
			return res.status(200).send(data);
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
	static async loginApple(req, res) {
		let { data_login } = req.body;
		if (!data_login)
			return res.status(422).send({
				error: "data-login-is-require"
			});
		try {
			let setting = await SettingModel.findOne({});
			let data_apple = await appleSigninAuth.verifyIdToken(
				data_login.identityToken,
				{
					nonce: data_login.nonce
						? crypto.createHash("sha256").update(data_login.nonce).digest("hex")
						: undefined
				}
			);
			if (!data_apple.sub)
				return res.status(422).send({
					error: "apple-login-failed"
				});

			let user = await UserModel.findOne({
				$or: [
					{ email: data_apple.email },
					{ uid: data_apple.sub, type_login: "apple" }
				]
			});
			let first_login = !user;
			if (!user) {
				let user_data = {
					email: data_apple.email,
					password: data_apple.sub,
					fullname:
						data_login.fullName.familyName || data_apple.sub.slice(0, 10),
					type_login: "apple",
					uid: data_apple.sub,
					email_verified: true
				};

				let language = await LanguageModel.findOne({ locale: "vi" });
				user_data.language = language._id;
				let new_user = new UserModel(user_data);
				new_user.setPassword(user_data.password);
				user = await new_user.save();

				if (user.email && setting.send_mail) {
					let emailModule = new EmailModule(
						"register_account",
						"vi",
						user_data.email
					);
					await emailModule.send_email({
						full_name: user_data.fullname,
						email: user_data.email
					});
				}
			} else {
				let data_update = {};
				!user.email_verified && (data_update.email_verified = true);
				!user.uid && (data_update.uid = data_apple.sub);
				user.type_login !== "apple" && (data_update.type_login = "apple");
				if (Object.keys(data_update).length > 0)
					await UserModel.findOneAndUpdate(
						{
							_id: user._id
						},
						data_update
					);
			}
			let token = await AuthController.generateToken({
				id: user._id,
				email: user.email,
				uid: user.uid
			});
			let data = user.jsonData();
			data.token = token;
			data.first_login = first_login;
			data.need_otp = setting.need_otp;
			return res.status(200).send(data);
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
	static async loginGoogle(req, res) {
		let { access_token } = req.body;
		if (!access_token)
			return res.status(422).send({
				error: "access-token-is-require"
			});
		try {
			let data_google = await Fetch.get({
				path: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${access_token}`,
				credentials: "include"
			});
			if (!data_google.sub)
				return res.status(422).send({
					error: "google-login-failed"
				});
			let setting = await SettingModel.findOne({});
			let user = await UserModel.findOne({
				$or: [
					{ email: data_google.email },
					{ uid: data_google.sub, type_login: "google" }
				]
			});
			let first_login = !user;
			if (!user) {
				let user_data = {
					email: data_google.email,
					password: data_google.sub,
					avatar: data_google.picture
						? `${data_google.picture.split("=").slice(0, -1).join("")}=s300`
						: "",
					fullname: data_google.name || data_google.sub.slice(0, 10),
					type_login: "google",
					uid: data_google.sub,
					email_verified: true
				};
				let language = await LanguageModel.findOne({ locale: "vi" });
				user_data.language = language._id;
				let new_user = new UserModel(user_data);
				new_user.setPassword(user_data.password);
				user = await new_user.save();

				if (user.email && setting.send_mail) {
					let emailModule = new EmailModule(
						"register_account",
						"vi",
						user_data.email
					);
					await emailModule.send_email({
						full_name: user_data.fullname,
						email: user_data.email
					});
				}
			} else {
				let data_update = {};
				!user.email_verified && (data_update.email_verified = true);
				!user.uid && (data_update.uid = data_google.sub);
				user.type_login !== "google" && (data_update.type_login = "google");
				if (Object.keys(data_update).length > 0)
					await UserModel.findOneAndUpdate(
						{
							_id: user._id
						},
						data_update
					);
			}
			let token = await AuthController.generateToken({
				id: user._id,
				email: user.email,
				uid: user.uid
			});
			let data = user.jsonData();
			data.token = token;
			data.first_login = first_login;
			data.need_otp = setting.need_otp;
			return res.status(200).send(data);
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
	static async generateToken(payload, member = false) {
		let expiresIn = "365d";
		// if (member) expiresIn = "365d";
		const secret = process.env.JWT_SECRET_USER;
		const options = { expiresIn };
		try {
			let check_token_log = await TokenLogModel.findOne({
				user_id: payload.id,
				status: true
			}).sort({
				created_at: -1
			});
			if (check_token_log) payload.time = check_token_log.time;
			const token = jwt.sign(payload, secret, options);
			return token;
		} catch (error) {
			console.log(error);
		}
	}
	static async phone(req, res) {
		let { uid, phone } = req.body;
		try {
			let user = await FirebaseModule.getUserPhone({ uid, phone });
			if (!user) return res.status(404).send({ error: "user-phone-not-found" });
			return res.status(200).send({ message: "user-phone-verified" });
		} catch (error) {
			console.log(error);
			return res.status(400).send(error);
		}
	}
}
module.exports = AuthController;
