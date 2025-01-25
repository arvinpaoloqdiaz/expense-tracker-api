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

//[SECTION] Get Budget
module.exports.getBudget = async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Get Budget
        const budgetArray = await Budget.find({userId:req.user.id}).session(session);
        if(budgetArray.length === 0) {
           await session.commitTransaction();
            return res.status(404).send({
                message:"No Budget for User!",
                response:false,
                data:null 
            });
        };
        await session.commitTransaction();
        return res.status(200).send({
            message:"Budget Retrieved",
            response:true,
            data:budgetArray
        })

    } catch(error) {
        await session.abortTransaction();
        return res.status(500).send({
            message:"Internal Server Error",
            response:false,
            data:error
        })
    } finally {
        await session.endSession();
    }
}

//[SECTION] Edit Budget Details
module.exports.editBudget = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { budgetId } = req.params;
        const { title, description, source, priority } = req.body;

        // Find the budget using the transaction session
        const budget = await Budget.findById(budgetId).session(session);

        // Check if the budget exists
        if (!budget) {
            await session.abortTransaction();
            return res.status(404).send({
                message: "No Budget found!",
                response: false,
                data: null
            });
        }

        // Check if the budget belongs to the logged-in user
        if (req.user.id !== budget.userId.toString()) {
            await session.abortTransaction();
            return res.status(403).send({
                message: "You are not authorized to edit this budget!",
                response: false,
                data: null
            });
        }

        // Update the budget fields
        budget.title = title || budget.title;
        budget.description = description || budget.description;
        budget.source = source || budget.source;
        budget.priority = priority || budget.priority;
        budget.updatedAt = Date.now();

        // Save the updated budget within the transaction
        await budget.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).send({
            message: "Budget updated successfully!",
            response: true,
            data: budget
        });
    } catch (error) {
        // Abort transaction in case of an error
        await session.abortTransaction();
        console.error("Error updating budget:", error); // Log the error for debugging
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: null
        });
    } finally {
        await session.endSession();
    }
};

// [SECTION] Deletes a budget
module.exports.deleteBudget = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { budgetId } = req.params;

        // Find the budget using the transaction session
        const budget = await Budget.findById(budgetId).session(session);

        // Check if the budget exists
        if (!budget) {
            await session.abortTransaction();
            return res.status(404).send({
                message: "No Budget found!",
                response: false,
                data: null,
            });
        }

        // Check if the budget belongs to the logged-in user
        if (req.user.id !== budget.userId.toString()) {
            await session.abortTransaction();
            return res.status(403).send({
                message: "You are not authorized to delete this budget!",
                response: false,
                data: null,
            });
        }

        // Delete the budget
        await Budget.findByIdAndDelete(budgetId, { session });

        // Find the user and update their budgetId array
        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { budgetArray: budgetId } }, // Remove the budgetId from the array
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).send({
            message: "Budget deleted successfully!",
            response: true,
            data: null,
        });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error,
        });
    } finally {
        // End the session
        await session.endSession();
    }
};

