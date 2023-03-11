const sha256 = require("sha256");
const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;

class Helper {
	static secretSHA256(string) {
		return sha256(process.env.SECRET + string);
	}
	static validateEmail(email) {
		const re =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}
	static validateProfileUrl(url) {
		const re = /^(\w)+$/;
		return re.test(String(url).toLowerCase());
	}
	static randomCode(length) {
		let text = "";
		let chars =
			"abcdefghijklmnopqrstuvwxyzdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";

		for (let i = 0; i < length; i++) {
			text += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		text = text.toString().toLowerCase();
		return text;
	}

	static getFolderNameByMonth() {
		var d = new Date();
		return `${d.getMonth() + 1}-${d.getFullYear()}`;
	}
	static async axios(method, url, headers, data) {
		try {
			var config = {
				method: method,
				url: url,
				headers: headers,
				data: data
			};
			return await axios(config);
		} catch (error) {
			return false;
		}
	}
	static isValidObjectId(id) {
		if (ObjectId.isValid(id)) {
			if (new ObjectId(id).toString() === id) return true;
			return false;
		}
		return false;
	}
	static validateMessage(message) {
		if (message.length > 250) return false;
		return true;
	}
	static getRandomArbitrary(min, max) {
		let t = Math.floor(Math.random() * (max - min)) + min;
		return t;
	}
	static interval(start_date, end_date) {
		let arr_date = [];
		do {
			arr_date.push(start_date.format("ll"));
			start_date = start_date.add(1, "day");
		} while (start_date <= end_date);
		return arr_date;
	}
	static typeValue(value) {
		return Object.prototype.toString.call(value).slice(8, -1);
	}
}

module.exports = Helper;
