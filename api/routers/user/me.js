const express = require("express");
const MeController = require("../../controllers/user/me");
const Me = express.Router();

Me.get("/me/information", MeController.userInfo);
Me.post("/me/update", MeController.updateInfo);

module.exports = Me;
