const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true,"title is required!"]
		},
		description:{
			type: String
		},
		source:{
			type:String,
			required: [true,"source is required!"]
		},
		userId:{
			type:mongoose.Schema.Types.ObjectId,
			ref: User,
			required: [true: "userId is required!"]
		},
		originalAmount: {
			type: mongoose.Schema.Types.Decimal128,
			required: [true, "originalAmount is required!"],
			min: 0,
			get: (value) => parseFloat(value.toString())
		},
		currentAmount:{
			type: mongoose.Schema.Type.Decimal128,
			required: [true, "currentAmount is required!"],
			min: 0,
			get: (value) => parseFloat(value.toString())
		},
		priority:{
			type: Number,
			default: 1,
		},
		isSpent:{
			type: Boolean,
			default:false
		},
		budgetGroupIdArray:[
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "BudgetGroup"
			}
		]
		createdAt: {
			type: Date,
			default: Date.now
		}

	}
);

module.exports = mongoose.model("Budget",budgetSchema);