const express = require('express');
const userController = require('../controllers/user');
const userGroupController = require('../controllers/userGroup');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Create New Group
router.post("/create", verify, userGroupController.createGroup);

// Add Members to Group
router.put("/add/:groupId/:userId",verify, userGroupController.addMember);

// Remove Members to Group
router.delete("/remove/:groupId/:userId",verify, userGroupController.removeMember);

// Delete Group
router.delete("/delete/:groupId",verify, userGroupController.deleteGroup);

// Change Owner
router.put("/owner/:groupId/:userId", verify, userGroupController.changeOwner);

// [SECTION] Export Route System
module.exports = router;