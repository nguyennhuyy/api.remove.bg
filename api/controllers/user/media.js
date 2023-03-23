const fs = require("fs");
const FormData = require("form-data");
const MediaModel = require("../../models/Media");
const convert = require("heic-convert");
const { cloudinary } = require("../../../plugins/cloudinary");
const Rimraf = require("rimraf");

class MediaController {
	static async cloudUpload(req, res) {
		try {
			await Promise.all(
				req.files.map(async file => {
					let data = await cloudinary.uploader.upload(file.path);
					// let reg = new RegExp(`/upload/(v[0-9]+)/(${data.public_id}.*)`);
					// let regExec = reg.exec(data.url);
					// let path = `${process.env.MEDIA_PUBLISH}/cloud/${process.env.CLOUDINARY_NAME}/uid/${regExec[1]}/${regExec[2]}`;
					return res.status(200).send({
						image: data.url
					});
				})
			);
		} catch (error) {
			console.log(error);
			return res.status(400).send({ error: "upload-media-error" });
		}
	}
}
module.exports = MediaController;
