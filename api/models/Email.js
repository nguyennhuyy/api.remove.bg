const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const EmailTemplate = require("./TemplateEmail");

class EmailModule {
	constructor(keyword, language, to) {
		this.keyword = keyword;
		this.language = language;
		this.to = to;
	}

	async sendEmail({ email, subject, fullname, codeOtp }) {
		try {
			let transporter = await this.generateTransporter();
			await transporter.sendMail({
				from: process.env.MAIL_USERNAME,
				to: email,
				subject: subject || "",
				html: `
        Xin chào ${fullname},
        </br>
        </br>
        Otp quên mật khẩu của bạn là : ${codeOtp}
        ` // html body
			});
		} catch (error) {
			console.error(error);
		}
	}

	async generateTransporter() {
		try {
			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: process.env.MAIL_USERNAME,
					pass: process.env.MAIL_PASSWORD
				}
			});
			return transporter;
		} catch (error) {
			console.error("error generateTransporter: ", error);
		}
	}

	replaceContent(
		content,
		{ codeForgotPassword, email, fullName, codeOtp, amount }
	) {
		return content.replace(/{{([^{}]+)}}/g, function (keyExpr, key) {
			switch (key) {
				case "CODE_FORGOT_PASSWORD":
					return codeForgotPassword;
				case "CODE_OTP":
					return codeOtp;
				case "FULL_NAME":
					return fullName;
				case "EMAIL":
					return email;
				case "AMOUNT":
					return new Intl.NumberFormat("de-DE", {
						style: "currency",
						currency: "VND"
					}).format(amount);
			}
		});
	}
}

module.exports = EmailModule;
