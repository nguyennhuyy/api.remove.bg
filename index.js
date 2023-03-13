const express = require("express");

const app = express();
const bodyParser = require("body-parser");
var morgan = require("morgan");
const db = require("./plugins/db");
const jwt = require("jsonwebtoken");
const path = require("path");
const http = require("http");

require("dotenv").config({
	path: "./.env"
});
global.appRoot = path.resolve(__dirname);
db();
const cors = require("cors");
app.use(cors());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let port = process.env.PORT || 3000;

app.use("/api/v1", require("./api"));
app.listen(port, () => {
	console.log(`Server running at ${port}`);
});

module.exports = app;
