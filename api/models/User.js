const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Helper = require("../../plugins/helper");
const moment = require("moment");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match:
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    count_forgot_password: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: false,
      default: "",
    },
    hash: {
      type: String,
      required: true,
    },
    gender: {
      type: Number,
      required: false,
      default: 1,
    },
    verify: {
      type: Boolean,
      required: false,
      default: false,
    },
    avatar: {
      type: String,
      required: false,
      default: "",
    },
    coverimage: {
      type: String,
      required: false,
      default: "",
    },
    birthday: {
      type: String,
      required: false,
      default: "",
    },
    salt: {
      type: String,
      required: true,
    },
    created_time: {
      type: Number,
      default: Math.round(new Date().getTime() / 1000),
    },
    updated_time: {
      type: Number,
      default: Math.round(new Date().getTime() / 1000),
    },

    green_tick: {
      type: Boolean,
      default: false,
    },
    type_login: {
      type: String,
      default: "",
    },
    uid: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
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
    hash: hash,
  };
};
userSchema.methods.generateJWT = function (member = false) {
  let expiresIn = "2d";
  if (member) expiresIn = "365d";

  const payload = {
    email: this.email,
    id: this._id,
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
    uid: this.uid,
    green_tick: this.green_tick,
    type_login: this.type_login,
    created_time: this.created_time,
    updated_time: this.updated_time,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

userSchema
  .virtual("updatePassword")
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
  this.set({ updated_time: Math.round(new Date().getTime() / 1000) });
  done();
});

userSchema.pre("save", async function (done) {
  this.created_time = Math.round(new Date().getTime() / 1000);
  this.created_at = moment
    .utc(this.created_at, "MM-DD-YYYY")
    .format("YYYY-MM-DD");
  done();
});

userSchema.index({ id: -1 });
const userModel = mongoose.model("user", userSchema, "user");
module.exports = userModel;
