const mongoose = require("mongoose");
const imageRemove = new mongoose.Schema(
	{
		uid: {
			type: String,
			required: true
		},
		name_img: {
			type: Number
		},
		img_base64: {
			type: String,
			require: true
		},
		size_img: {
			type: String,
			required: true
		}
	}
	// { timestamps: { createdAt: "created_time", updatedAt: "created_time" } }
);

module.exports = mongoose.model("imageremove", imageRemove, "imageremove");
