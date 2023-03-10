const mongoose = require("mongoose");
module.exports = async () => {
	let conn = await mongoose.connect(
		"mongodb+srv://huyreactjs:Huydev2001@cluster0.4aixbal.mongodb.net/ApiRemoveBg?retryWrites=true&w=majority",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	);
	console.log("MongoDB Connected: ", conn);
};
