const express = require("express");
const AuthController = require("../../controllers/client/auth");
const Auth = express.Router();

Auth.post("/auth/register", AuthController.register);
Auth.post("/auth/login", AuthController.login);
Auth.post("/auth/facebook/login", AuthController.loginFacebook);
Auth.post("/auth/google/login", AuthController.loginGoogle);
module.exports = Auth;
