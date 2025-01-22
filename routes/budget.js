const express = require('express');
const budgetController = require('../controllers/budget');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Create Budget Object
router.post("/create",verify,budgetController.createBudget);

// [SECTION] Export Route System
module.exports = router;