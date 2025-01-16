const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true,"title is required!"]
		},
		description:{
			type: String
		},
		userId: {
			type:mongoose.Schema.Types.ObjectId,
			ref: User,
			required: [true: "userId is required!"]
		},
		cost: {
			type: mongoose.Schema.Types.Decimal128,
			required: [true, "cost is required!"],
			min: 0,
			get: (value) => parseFloat(value.toString())
		},
		currentPaid:{
			type: mongoose.Schema.Type.Decimal128,
			required: [true, "currentPaid is required!"],
			min: 0,
			get: (value) => parseFloat(value.toString())
		},
		priority:{
			type: Number,
			default: 1,
		},
		isPaid:{
			type: Boolean,
			default:false
		},
		expenseGroupId:[
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "ExpenseGroup"
			}
		]
		createdAt: {
			type: Date,
			default: Date.now
		},
		deadline: {
			type: Date
		}

	}
);

module.exports = mongoose.model("Expense",expenseSchema);