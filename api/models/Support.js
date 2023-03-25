const mongoose = require("mongoose");
const Helper = require("../../plugins/helper");
const moment = require("moment");

const supportSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			match:
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		},
		subject: {
			type: String,
			required: true,
			default: ""
		},
		message: {
			type: String,
			required: true,
			default: ""
		},
		created_time: {
			type: Number,
			default: Math.round(new Date().getTime() / 1000)
		},
		updated_time: {
			type: Number,
			default: Math.round(new Date().getTime() / 1000)
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const supportModel = mongoose.model("support", supportSchema, "support");
module.exports = supportModel;
