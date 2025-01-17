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
// Delete Group
// Change Owner

// [SECTION] Export Route System
module.exports = router;