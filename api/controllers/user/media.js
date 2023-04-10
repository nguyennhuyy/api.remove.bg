const fs = require("fs");
const FormData = require("form-data");
const MediaModel = require("../../models/Media");
const convert = require("heic-convert");
const { cloudinary } = require("../../../plugins/cloudinary");
const Rimraf = require("rimraf");
const RemoveBg = require("remove.bg");
const ImageRemoveModel = require("../../models/ImageRemove");

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
	static async removeBg(req, res) {
		try {
			const { url } = req.body;
			let remove_img = await ImageRemoveModel.findOne({ url: url });

			if (remove_img) {
				return res.status(200).send({
					base64img: remove_img.img_base64
				});
			}
			let data = await RemoveBg.removeBackgroundFromImageUrl({
				url,
				apiKey: process.env.API_KEY,
				size: "regular",
				type: "auto"
			});
			if (data) {
				let opt = {
					uid: req.payload.id,
					name_img: data.rateLimitReset,
					img_base64: data.base64img,
					size_img: `${data.resultWidth} x ${data.resultHeight}`
				};
				let save = new ImageRemoveModel({ ...opt });
				save.save().then(() => {
					return res.status(200).send({
						base64img: data.base64img
					});
				});
			}
		} catch (error) {
			return res.status(400).send({ error: "remove-bg-error" });
		}
	}
}
module.exports = MediaController;
