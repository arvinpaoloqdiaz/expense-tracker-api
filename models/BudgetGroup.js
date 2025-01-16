const mongoose = require("mongoose");

const budgetGroupSchema = new mongoose.Schema(
	{
		userGroupId: {
		      type: mongoose.Schema.Types.ObjectId,
		      ref: "UserGroup" // References the User collection
		},
		expenseGroupId: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref:"Expense"
			}
		],
		totalAmount: {
			type: mongoose.Schema.Types.Decimal128,
			min: 0,
			required: true
		},
		currentAmount:{
			type: mongoose.Schema.Types.Decimal128,
			min: 0,
			required: true
		},
		totalExpense:{
			type: mongoose.Schema.Types.Decimal128,
			min: 0,
			required:true
		},
		budgetIdArray:[
			{
				type:mongoose.Schema.Types.ObjectId,
				ref:"Budget"
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

module.exports = mongoose.model("BudgetGroup",budgetGroupSchema);