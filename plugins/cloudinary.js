const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { generateFileName } = require("./helper");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
	cloudinary,
	allowedFormats: ["jpg", "png", "jpeg", "heic", "gif"],
	filename: function (req, file, cb) {
		let fileName = helper.generateFileName(file.originalname, file.mimetype);
		cb(null, file.fileName);
	}
});

const uploadCloud = multer({
	storage,
	limits: {
		fileSize: 20480 * 1024 * 1024,
		files: 10
	},
	fileFilter: async (req, file, cb) => {
		if (
			!["image/jpeg", "image/png", "image/gif", "image/heic"].includes(
				file.mimetype
			)
		)
			return cb(new Error("incorrect-file-format"), false);
		return cb(null, true);
	}
});

module.exports = { uploadCloud, cloudinary };
