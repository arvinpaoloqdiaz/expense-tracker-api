const mongoose = require("mongoose");

const userGroupSchema = new mongoose.Schema(
	{
		userId: [
		    {
		      type: mongoose.Schema.Types.ObjectId,
		      ref: "User" // References the User collection
		    }
		],
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