const Budget = require("../models/Budget");
const User = require("../models/User");
const UserGroup = require("../models/UserGroup");
const bcrypt = require('bcrypt');
const auth = require("../auth");
const mongoose = require('mongoose');
require("dotenv").config();

// [SECTION] Create Budget
module.exports.createBudget = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Generate a Budget Object
        const budget = new Budget({
            title: req.body.title,
            description: req.body.description,
            source: req.body.source,
            userId: req.user.id,
            expenseGroupIdArray: req.body.expenseGroupIdArray,
            originalAmount: req.body.originalAmount,
            currentAmount: req.body.originalAmount,
            priority: req.body.priority,
        });

        // Save the budget document
        await budget.save({ session });

        // Get User and Update BudgetArray
        const user = await User.findById(req.user.id).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).send({
                message: "User not found",
                response: false,
                data: null,
            });
        }

        user.budgetArray.push(budget._id);
        await user.save({ session });

        await session.commitTransaction();

        return res.status(201).send({
            message: "Budget created successfully",
            response: true,
            data: budget,
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error.message,
        });
    } finally {
        session.endSession();
    }
};
