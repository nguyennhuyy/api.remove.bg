const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { register, login } = require("../../validations/auth");
const UserModel = require("../../models/User");
const Fetch = require("../../../plugins/fetch");

const OtpModule = require("../../models/GenerateOtp");
const EmailModule = require("../../models//Email");
class AuthController {
	static async register(req, res) {
		let { email, fullname, password } = req.body;
		try {
			await register.validateAsync(req.body);
			let user_exits = await UserModel.findOne({
				email: email.trim().toLowerCase()
			});
			if (user_exits) return res.status(422).send("user-exists");
			let user = new UserModel(req.body);
			user.setPassword(password);
			user.save().then(() => {
				return res.status(200).send({
					fullname,
					email
				});
			});
		} catch (error) {
			return res.status(400).send(error);
		}
	}
	static async login(req, res) {
		let { email, password, remember } = req.body;
		try {
			await login.validateAsync(req.body);
			let user = await UserModel.findOne({
				email: email.trim().toLowerCase()
			});
			if (!user || user.status === "close")
				return res.status(404).send({ error: "user-not-found" });

			if (!user.validatePassword(password))
				return res.status(400).send({
					error: "user-incorrect-password"
				});

			let token = await AuthController.generateToken(
				{ id: user._id, email: user.email },
				remember
			);
			let data = user.jsonData();
			data.token = token;
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

				let new_user = new UserModel(user_data);
				new_user.setPassword(user_data.password);
				user = await new_user.save();
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
				let new_user = new UserModel(user_data);
				new_user.setPassword(user_data.password);
				user = await new_user.save();
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
			const token = jwt.sign(payload, secret, options);
			return token;
		} catch (error) {
			console.log(error);
		}
	}
	static async fotgotPassword(req, res) {
		try {
			let { email } = req.body;
			let user = await UserModel.findOne({
				email: email.trim().toLowerCase()
			});
			if (!user)
				return res.status(404).json({
					error: "user-not-found"
				});

			let generator = await OtpModule.generatorForgotPassword({
				email: email.trim().toLowerCase(),
				type: "forgot_password"
			});
			if (generator.status === "new") {
				let emailSend = new EmailModule("forgot_password", "vi", email);
				console.log(emailSend);
				await emailSend.sendEmail({
					fullname: user.fullname,
					subject: "Quên mật khẩu",
					email: user.email,
					codeOtp: generator.otp
				});
			}

			return res.status(201).json({ message: "send email success" });
		} catch (error) {
			console.error(error);
		}
	}
	static async resetPassword(req, res) {
		try {
			let { password, code, email } = req.body;
			let user = await UserModel.findOne({
				email
			});
			if (!user)
				return res.status(404).send({
					error: "user-not-found"
				});

			let status = await OtpModule.verify({
				code,
				type: "forgot_password",
				email
			});
			if (!status)
				return res.status(404).send({
					error: "code-not-verify"
				});
			user.updatePassword = password;
			await user.save();
			return res.status(201).json(user);
		} catch (error) {
			console.error(error);
			return res.status(401).send({
				error: "change-password-error"
			});
		}
	}
}
module.exports = AuthController;
