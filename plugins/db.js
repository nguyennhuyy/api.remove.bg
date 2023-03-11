const mongoose = require("mongoose");
module.exports = async () => {
	let conn = await mongoose.connect(process.env.DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
};
