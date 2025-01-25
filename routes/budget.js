const express = require('express');
const budgetController = require('../controllers/budget');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Create Budget Object
router.post("/create",verify,budgetController.createBudget);

// Get Budget 
router.get("/get", verify, budgetController.getBudget);

// Edit Budget Details (Excluding Amount)
router.put("/edit/:budgetId",verify,budgetController.editBudget);

// Delete Budget Object
router.delete("/delete/:budgetId", verify, budgetController.deleteBudget);

// [SECTION] Export Route System
module.exports = router;