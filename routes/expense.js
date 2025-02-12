const express = require('express');
const expenseController = require('../controllers/expense');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Create Budget Object
router.post("/create",verify,expenseController.createExpense);

// Get Budget
router.get("/get", verify, expenseController.getExpense);


// [SECTION] Export Route System
module.exports = router;