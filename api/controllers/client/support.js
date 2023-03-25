const supportModel = require("../../models/Support");
const { supportValidate } = require("../../validations/support");
class SupportController {
	static async contact(req, res) {
		try {
			const { email, subject, message } = req.body;
			let data = {
				email,
				subject,
				message
			};
			await supportValidate.validateAsync(req.body);
			let new_contact = new supportModel(data);
			new_contact.save().then(() => {
				return res.status(200).send({
					message: "send-contact-success"
				});
			});
		} catch (error) {
			console.log(">>> error", error);
			return res.status(400).send(error);
		}
	}
}
module.exports = SupportController;
