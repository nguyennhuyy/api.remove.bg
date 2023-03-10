const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const SequenceModule = require("./Sequence");
const Helper = require("../../plugins/helper");
const moment = require("moment");

const profession = new mongoose.Schema({
	profession_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "profession"
	}
});
const topic = new mongoose.Schema({
	topic_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "appointment_topic"
	}
});
const interest = new mongoose.Schema({
	interests_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "interests"
	}
});

const language = new mongoose.Schema({
	language_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "language"
	}
});
const userSchema = new mongoose.Schema(
	{
		fullname: {
			type: String,
			required: true
		},
		email: {
			type: String,
			match:
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		},
		email_verified: {
			type: Boolean,
			default: false
		},
		total: {
			type: Number,
			default: 0
		},
		count_forgot_password: {
			type: Number,
			default: 0
		},
		address: {
			type: String,
			required: false,
			default: ""
		},
		hash: {
			type: String,
			required: true
		},
		gender: {
			type: Number,
			required: false,
			default: 1
		},
		star_avg: {
			type: Number,
			required: false,
			default: 0
		},
		verify: {
			type: Boolean,
			required: false,
			default: false
		},
		avatar: {
			type: String,
			required: false,
			default: ""
		},
		coverimage: {
			type: String,
			required: false,
			default: ""
		},
		birthday: {
			type: String,
			required: false,
			default: ""
		},
		company: {
			type: String,
			required: false,
			default: ""
		},
		introduce: {
			type: String,
			required: false,
			default: ""
		},
		notification: {
			type: Boolean,
			default: true
		},
		phone: {
			type: String,
			required: false,
			default: ""
		},
		referral_code: {
			type: String,
			required: false,
			default: ""
		},
		system_commission: {
			type: Number,
			default: 20
		},
		giving_commission: {
			type: Number,
			default: 20
		},
		affiliate_percent: {
			type: Number,
			default: 5
		},
		affiliate: {
			type: String,
			required: false,
			default: ""
		},
		affiliate_code: {
			type: String,
			required: false,
			default: ""
		},
		policy: {
			type: Boolean,
			default: false
		},
		language: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: "language"
		},
		languages: [language],
		status: {
			type: String,
			required: false,
			default: "new" //close
		},
		interests: [interest],
		topics: [topic],
		professions: [profession],
		salt: {
			type: String,
			required: true
		},
		created_time: {
			type: Number,
			default: Math.round(new Date().getTime() / 1000)
		},
		updated_time: {
			type: Number,
			default: Math.round(new Date().getTime() / 1000)
		},
		notes: {
			type: Array,
			default: []
		},
		green_tick: {
			type: Boolean,
			default: false
		},
		type_login: {
			type: String,
			default: ""
		},
		uid: {
			type: String,
			default: ""
		},
		sum_rate: {
			type: Number,
			default: 0
		},
		count_rate: {
			type: Number,
			default: 0
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

userSchema.index({ email: 1, phone: 1, referral_code: 1 }, { unique: true });

userSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
		.toString("hex");
};

userSchema.methods.validatePassword = function (password) {
	const hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
		.toString("hex");
	return this.hash === hash;
};

userSchema.methods.passwordEncryption = function (
	password,
	salt,
	length = 512
) {
	console.log("passwordEncryption : ", password, salt);
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, length, "sha512")
		.toString("hex");
	return hash;
};
userSchema.methods.initSaltAndHash = function (password) {
	const salt = crypto.randomBytes(16).toString("hex");
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return {
		salt: salt,
		hash: hash
	};
};
userSchema.methods.generateJWT = function (member = false) {
	let expiresIn = "2d";
	if (member) expiresIn = "365d";

	const payload = {
		email: this.email,
		id: this._id
	};
	const secret = process.env.JWT_SECRET;
	const options = { expiresIn };
	const token = jwt.sign(payload, secret, options);
	return token;
};

userSchema.methods.jsonData = function () {
	return {
		_id: this._id,
		fullname: this.fullname,
		email: this.email,
		email_verified: this.email_verified,
		address: this.address,
		gender: this.gender,
		avatar: this.avatar,
		coverimage: this.coverimage,
		birthday: this.birthday,
		verify: this.verify,
		place: this.place,
		star_avg: this.star_avg,
		company: this.company,
		topics: this.topics,
		interests: this.interests,
		introduce: this.introduce,
		phone: this.phone,
		referral_code: this.referral_code,
		affiliate: this.affiliate,
		total: this.total,
		policy: this.policy,
		uid: this.uid,
		green_tick: this.green_tick,
		type_login: this.type_login,
		languages: this.languages,
		language: this.language,
		status: this.status,
		created_time: this.created_time,
		updated_time: this.updated_time,
		created_at: this.created_at,
		updated_at: this.updated_at,
		professions: this.professions,
		notification: this.notification
	};
};

userSchema
	.virtual("password")
	.set(function (raw_pass) {
		this._password = raw_pass;
		this.salt = crypto.randomBytes(16).toString("hex");
		this.hash = crypto
			.pbkdf2Sync(raw_pass, this.salt, 10000, 512, "sha512")
			.toString("hex");
	})
	.get(function () {
		return this._password;
	});

userSchema.pre(/(updateOne|findOneAndUpdate)/, async function (done) {
	// let record = await this.model.findOne(this.getQuery());
	this.set({ updated_time: Math.round(new Date().getTime() / 1000) });
	done();
});

userSchema.pre("save", async function (done) {
	// this.url = this._id;
	this.created_time = Math.round(new Date().getTime() / 1000);
	this.created_at = moment
		.utc(this.created_at, "MM-DD-YYYY")
		.format("YYYY-MM-DD");
	if (this.isNew) {
		let Sequence = new SequenceModule("user");
		let next_val = await Sequence.nextVal();

		this.referral_code = `${next_val}${Helper.randomCode(3)}`;
	}
	done();
});

userSchema.index({ id: -1 });
const userModel = mongoose.model("user", userSchema, "user");
module.exports = userModel;
