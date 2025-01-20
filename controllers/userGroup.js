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
Remove Function: 
-Only owner can remove non self
-can remove self (quit)
-if owner remove self, change owner to next
-if owner remove self and only one member, delete group
-cannot remove first group created
1. Check if IDs are valid
2. Check if User is owner of group
3. Check if ID is self
*/
module.exports.removeMember = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Get Params
        const { groupId, userId } = req.params;
        
        // Get User Data (self)
        const self = await User.findById(req.user.id).session(session);

        // Validate if self is a part of groupId
        if (!self.userGroupArray.includes(groupId)) {

            await session.commitTransaction();
            session.endSession();

            return res.status(400).send({
                message: "You are not part of the group!",
                response: false,
                data: null
            });
        }

        // Validate if group is not the first created
        if (groupId == self.userGroupArray[0]) {
            await session.commitTransaction();
            session.endSession();
            
            return res.status(400).send({
                message: "Cannot modify default group!",
                response: false,
                data: self.userGroupArray[0]
            });
        }

        // Get Group Data
        const group = await UserGroup.findById(groupId).session(session);
        if (!group) {
            return res.status(404).send({
                message: "Group does not exist!",
                response: false,
                data: null
            });
        }

        // Check if self is the owner
        const isOwner = req.user.id == group.owner;

        // CASE: Owner trying to remove themselves
        if (isOwner && req.user.id == userId) {
            if (group.userIdArray.length === 1) {
                // If only one member, delete the group
                await UserGroup.findByIdAndDelete(groupId).session(session);

                // Remove groupId from user's group array
                self.userGroupArray = self.userGroupArray.filter(id => id.toString() !== groupId);
                await self.save({ session });

                await session.commitTransaction();
                session.endSession();

                return res.status(200).send({
                    message: "Group deleted as the owner left and no other members existed.",
                    response: true,
                    data: null
                });
            } else {
                // Assign ownership to the next member
                const nextOwner = group.userIdArray.find(member => member.toString() !== userId);
                group.owner = nextOwner;
                group.userIdArray = group.userIdArray.filter(member => member.toString() !== userId);
                await group.save({ session });

                // Remove groupId from user's group array
                self.userGroupArray = self.userGroupArray.filter(id => id.toString() !== groupId);
                await self.save({ session });

                await session.commitTransaction();
                session.endSession();

                return res.status(200).send({
                    message: "Owner left the group. Ownership transferred to the next member.",
                    response: true,
                    data: group
                });
            }
        }

        // CASE: Owner removing a non-self member
        if (isOwner && req.user.id !== userId) {
            // Validate if userId is part of the group
            const memberToRemove = await User.findById(userId).session(session);
            if (!memberToRemove || !group.userIdArray.includes(userId)) {
                return res.status(400).send({
                    message: "User to remove is not part of the group!",
                    response: false,
                    data: null
                });
            }

            // Remove member from the group
            group.userIdArray = group.userIdArray.filter(member => member.toString() !== userId);
            await group.save({ session });

            // Remove groupId from the removed user's group array
            memberToRemove.userGroupArray = memberToRemove.userGroupArray.filter(id => id.toString() !== groupId);
            await memberToRemove.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).send({
                message: "Member removed from the group successfully.",
                response: true,
                data: group
            });
        }

        // CASE: Non-owner removing themselves
        if (!isOwner && req.user.id == userId) {
            // Remove self from the group
            group.userIdArray = group.userIdArray.filter(member => member.toString() !== userId);
            await group.save({ session });

            // Remove groupId from user's group array
            self.userGroupArray = self.userGroupArray.filter(id => id.toString() !== groupId);
            await self.save({ session });
            console.log(typeof groupId)
            await session.commitTransaction();
            session.endSession();

            return res.status(200).send({
                message: "You have left the group successfully.",
                response: true,
                data: group
            });
        }

        // CASE: Non-owner trying to remove another member
        return res.status(403).send({
            message: "You do not have permission to remove members from this group.",
            response: false,
            data: group
        });
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();

        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error.message
        });
    }
};

// [SECTION] Delete Group (Only Owner), Cannot remove initial group created
module.exports.deleteGroup = async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { groupId } = req.params;
        // Get Group Data
        const group = await UserGroup.findById(groupId).session(session);
        
        if(!group){

            await session.abortTransaction();
            session.endSession();

            return res.status(404).send({
                message:"Group not found!",
                response:false,
                data:null
            })
        }
        // Get User Data
        const user = await User.findById(req.user.id).session(session);
        if(!user){

            await session.abortTransaction();
            session.endSession();

            return res.status(404).send({
                message:"User not found!",
                response:false,
                data:null
            })
        }
        // Validate if User is owner of the group
        if(!(group.owner == req.user.id)){

            await session.commitTransaction();
            session.endSession();

            return res.status(400).send({
                message:"You are not the owner of this group",
                response:false,
                data:group
            })
        }

        // Validate if Group to be deleted is Initial Group of User
        if(user.userGroupArray[0] == groupId){
            await session.abortTransaction();
            session.endSession();

            return res.status(400).send({
                message:"Cannot modify initial group!",
                response: false,
                data: group
            })
        }
        // Remove Group ID from Members in the Group
        for (const userId of group.userIdArray) {
            await User.findByIdAndUpdate(
            userId,
            { $pull: { userGroupArray: groupId } },
            { session }
            );
        }
        // Delete Group in UserGroup table
        const deletedGroup = await UserGroup.findByIdAndDelete(groupId);
        if(!deletedGroup){
            await session.abortTransaction();
            session.endSession();

            return res.status(422).send({
                message:"Cannot delete Group!",
                reponse:false,
                data:null
            })
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({
            message:"Group successfully deleted!",
            response:true,
            data:deletedGroup
        })
    } catch(error){
        await session.abortTransaction();
        session.endSession();

        return res.status(500).send({
            message:"Internal Server Error",
            response: false,
            data: error
        })
    }
}