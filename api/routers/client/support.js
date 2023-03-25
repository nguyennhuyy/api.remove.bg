const express = require("express");
const SupportController = require("../../controllers/client/support");
const Support = express.Router();
Support.post("/support/contact", SupportController.contact);

module.exports = Support;
