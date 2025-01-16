const mongoose = require("mongoose");

const expenseGroupSchema = new mongoose.Schema(
	{
		title:{
			type: String,
			required: true
		},
		description: {
			type: String
		},
		userGroupId: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"UserGroup",
			required:true
		},
		budgetGroupId: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"BudgetGroup"
		},
		total_cost:{
			type: mongoose.Schema.Types.Decimal128,
			min: 0,
			required: true
		},
		cost_limit:{
			type:mongoose.Schema.Types.Decimal128,
			min:0
		},
		expenseType:{
			type: String,
			required: true
		},
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

module.exports = mongoose.model("ExpenseGroup",expenseGroupSchema);