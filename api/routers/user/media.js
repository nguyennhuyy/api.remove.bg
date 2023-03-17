const express = require("express");
const uploadCloud = require("../../../plugins/cloudinary");
const MediaController = require("../../controllers/user/media");
const Media = express.Router();
Media.post(
	"/media/cloud/upload",
	uploadCloud.array("image"),
	MediaController.cloudUpload
);
module.exports = Media;
