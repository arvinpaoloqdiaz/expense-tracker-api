const express = require('express');
const userController = require('../controllers/user');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Register a user
router.post("/register", userController.registerUser);

// Login a user
router.post("/login", userController.loginUser);

/*[USER ROUTES]*/

// Get User details
router.get("/profile",verify,userController.getDetails);

// Edit User details
router.put("/edit",verify,userController.editProfile);

// Change Password
router.put("/changepass",verify,userController.changePassword);

// Fetch Groups User is a member of
// router.get("/groups", verify,userController.getGroups);

// /*[ADMIN ROUTES]*/
// // Get all users
// router.get("/users",verify, verifyAdmin, userController.getUsers)

// [SECTION] Export Route System
module.exports = router;