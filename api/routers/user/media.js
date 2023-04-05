const express = require("express");
const { uploadCloud } = require("../../../plugins/cloudinary");
const MediaController = require("../../controllers/user/media");
const Media = express.Router();
Media.post(
	"/media/cloud/upload",
	uploadCloud.single("image"),
	MediaController.cloudUpload
);
Media.post("/media/removebg", MediaController.removeBg);
module.exports = Media;
