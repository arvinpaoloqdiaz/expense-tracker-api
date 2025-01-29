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
router.get("/groups", verify,userController.getGroups);

/*[ADMIN ROUTES]*/
// Get all users
router.get("/users",verify, verifyAdmin, userController.getUsers);

// Get all groups
router.get("/all-groups",verify,verifyAdmin,userController.getAllGroups);

// Change User Type
router.put("/change/:userId",verify,verifyAdmin,userController.changeUserType);

// Get all Budget
router.get("/all-budget",verify,verifyAdmin,userController.getAllBudget);

// Delete a User
// router.delete("/delete/:userId",verify,verifyAdmin,userController.deleteUser);

// [SECTION] Export Route System
module.exports = router;