const mongoose = require("mongoose");
module.exports = async () => {
	let conn = await mongoose.connect(process.env.DB);
	if (conn) {
		console.log("connect DB success");
	}
};
