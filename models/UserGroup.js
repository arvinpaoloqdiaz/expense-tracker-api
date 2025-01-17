const mongoose = require("mongoose");

const userGroupSchema = new mongoose.Schema(
	{
		userIdArray: [
		    {
		      type: mongoose.Schema.Types.ObjectId,
		      ref: "User" // References the User collection
		    }
		],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"User",
			required:true
		},
		expenseGroupId: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref:"Expense"
			}
		],
		budgetGroupId: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Budget"
			}
		],
		createdAt: {
			type:Date,
			default: Date.now
		},
		lastUpdated: {
			type: Date,
			default: Date.now
		}	
	}
);

module.exports = mongoose.model("UserGroup",userGroupSchema);