const User = require("../models/User");
const UserGroup = require("../models/UserGroup");
const bcrypt = require('bcrypt');
const auth = require("../auth");
const mongoose = require('mongoose');
require("dotenv").config();
// [SECTION] Create a new Group


module.exports.createGroup = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate owner existence
        const owner = await User.findById(req.user.id).session(session);
        if (!owner) {
            return res.status(404).send({
                message: "User not found",
                response: false,
                data: null
            });
        }

        // Create new UserGroup
        const newUserGroup = new UserGroup({
            userIdArray: [req.user.id],
            owner: req.user.id
        });
        await newUserGroup.save({ session });

        // Update user's userGroupArray
        await User.updateOne(
            { _id: req.user.id },
            { $push: { userGroupArray: newUserGroup._id } },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).send({
            message: "User Group created!",
            response: true,
            data: newUserGroup
        });
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error.message
        });
    }
};


// [SECTION] Add Member to Group


module.exports.addMember = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { groupId, userId } = req.params;

        // Fetch and validate group
        const group = await UserGroup.findById(groupId).session(session);
        if (!group) {
            return res.status(404).send({
                message: "Group does not exist!",
                response: false,
                data: null
            });
        }

        // Fetch and validate user
        const addUser = await User.findById(userId).session(session);
        if (!addUser) {
            return res.status(404).send({
                message: "User does not exist!",
                response: false,
                data: null
            });
        }

        // Check if user is already a member
        if (group.userIdArray.includes(userId)) {
            return res.status(422).send({
                message: "User is already a member.",
                response: false,
                data: group
            });
        }

        // Add user to the group
        await UserGroup.updateOne(
            { _id: groupId },
            { 
                $addToSet: { userIdArray: userId }, // Prevent duplicate entries
                $set: { lastUpdated: Date.now() } // Update the timestamp
            },
            { session }
        );

        // Add group to the user's userGroupArray
        await User.updateOne(
            { _id: userId },
            { $addToSet: { userGroupArray: groupId } }, // Prevent duplicate entries
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({
            message: "User added successfully!",
            response: true,
            data: { groupId, userId }
        });
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error.message
        });
    }
};

// [SECTION] Remove Member from group
/*
1. Check if IDs are valid
2. Check if User is owner of group
3. Check id ID is self
*/
// module.exports.removeMember = async (req,res) => {
//     try{

//     } catch(error){
//         return res.status(500).send({
//             message:"Internal Server Error",
//             response: false,
//             data: error
//         })
//     }
// }