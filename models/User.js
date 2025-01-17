const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true,"firstName is required!"]
		},
		lastName: {
			type: String,
			required: [true,"lastName is required!"]
		},
		age: {
			type: Number,
			required: [true,"age is required!"]
		},
		email: {
			type: String,
			required: [true,"email is required!"],
			unique: true
		},
		username: {
			type: String,
			required: [true,"username is required!"],
			unique: true
		},
		password: {
			type: String,
			required: [true,"password is required!"],
		},
		isAdmin: {
			type: Boolean,
			default: false
		},
		userGroupArray:[
			{
				type:mongoose.Schema.Types.ObjectId,
				ref:"UserGroup"
			}
		],
		createdAt: {
			type: Date,
			default: Date.now
		},
		updatedAt: {
			type: Date,
			default: Date.now
		}

	}
);

module.exports = mongoose.model("User",userSchema);