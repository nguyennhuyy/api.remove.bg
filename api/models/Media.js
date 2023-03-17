const mongoose = require("mongoose");
const mediaSchema = new mongoose.Schema(
	{
		path: {
			type: String,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		size: {
			type: Number,
			required: true
		},
		mimetype: { type: String },
		seaweedfs_fid: {
			type: String
		},
		seaweedfs_url: {
			type: String
		},
		uid: String,
		created_by: {
			type: String,
			required: true
		},
		created_name: {
			type: String,
			default: "User",
			required: true
		}
	},
	{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("media", mediaSchema, "media");
