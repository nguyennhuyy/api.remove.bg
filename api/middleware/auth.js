const jwt = require("express-jwt");

const getTokenFromHeaders = req => {
	const {
		headers: { authorization }
	} = req;
	if (authorization && authorization.split(" ")[0] === "Bearer") {
		let token = authorization.split(" ")[1];
		req.token = token;
		return token;
	}
	return null;
};

const isRevokedCallbackOption = async function (req, payload, done) {
	req.payload = payload;
	return done(null);
};

const isRevokedCallbackUser = async function (req, payload, done) {
	try {
		req.payload = payload;
		let options = {
			user_id: payload.id
		};
		if (payload.time) options.time = payload.time;
		return done(null);
	} catch (error) {
		return done({ status: 401, error });
	}
};

const auth = {
	optional: jwt({
		secret: process.env.JWT_SECRET_USER,
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		credentialsRequired: false,
		isRevoked: isRevokedCallbackOption,
		algorithm: ["RS256"]
	}),
	user: jwt({
		secret: process.env.JWT_SECRET_USER,
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		isRevoked: isRevokedCallbackUser,
		algorithm: ["RS256"]
	})
};
module.exports = auth;
