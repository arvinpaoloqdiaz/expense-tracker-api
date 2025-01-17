const User = require("../models/User");
const UserGroup = require("../models/UserGroup");
const bcrypt = require('bcrypt');
const auth = require("../auth");
require("dotenv").config();
// [SECTION] Create a new Group
module.exports.createGroup = async (req,res) => {
    try {
       // Fetch owner details
       const owner = await User.findById(req.user.id);
       if(!owner){
        return res.status(401).send({
            message:"User not found",
            response:false,
            data:null
        })
       }
       let newUserGroup = new UserGroup({
        userIdArray:[req.user.id],
        owner:req.user.id
       })
       await newUserGroup.save();
       
       return res.status(201).send({
        message:"User Group created!",
        response: true,
        data: newUserGroup
       })

    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).send({
            message: "Internal Server Error",
            response:false,
            data:error
        });
    }
};

// [SECTION] Add Member to Group
module.exports.addMember = async (req, res) => {
    try {
        // Fetch and validate group based on params
        const group = await UserGroup.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({
                message: "Group does not exist!",
                response: false,
                data: null
            });
        }

        // Fetch and validate User to add based on params
        const addUser = await User.findById(req.params.userId);
        if (!addUser) {
            return res.status(404).send({
                message: "User does not exist!",
                response: false,
                data: null
            });
        }

        // Check if user is already a member
        if (group.userIdArray.includes(addUser._id)) {
            return res.status(422).send({
                message: "User is already a member.",
                response: false,
                data: group
            });
        }

        // Add the user to the group and update
        group.userIdArray.push(addUser._id);
        group.lastUpdated = Date.now(); // Update the lastUpdated timestamp
        const updatedGroup = await group.save();

        return res.status(200).send({
            message: "User added successfully!",
            response: true,
            data: updatedGroup
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            response: false,
            data: error
        });
    }
};
