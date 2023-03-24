const fs = require("fs");
const FormData = require("form-data");
const MediaModel = require("../../models/Media");
const convert = require("heic-convert");
const { cloudinary } = require("../../../plugins/cloudinary");
const Rimraf = require("rimraf");

class MediaController {
	static async cloudUpload(req, res) {
		try {
			let data = await cloudinary.uploader.upload(req.file.path);
			return res.status(200).send({
				image: data.url
			});
		} catch (error) {
			console.log(error);
			return res.status(400).send({ error: "upload-media-error" });
		}
	}
}
module.exports = MediaController;
