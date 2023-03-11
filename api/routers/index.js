const middleware = require("../middleware/auth");

module.exports = function (app) {
	//Client
	app.use("/client", middleware.optional);
	app.use("/client", require("./client/auth"));
};
