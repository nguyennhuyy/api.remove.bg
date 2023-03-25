const middleware = require("../middleware/auth");

module.exports = function (app) {
	//Client
	app.use("/client", require("./client/auth"));
	app.use("/client", require("./client/support"));
	//User
	app.use("/user", middleware.user);
	app.use("/user", require("./user/me"));
	app.use("/user", require("./user/media"));
};
