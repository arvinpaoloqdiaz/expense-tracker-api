// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

// By default web browsers prevents a website from making requests to a different domain. CORS relaex this rule, allowing us or our website to communicate securely with other websites.
const userRoutes = require('./routes/user');
const userGroupRoutes = require('./routes/userGroup');
const budgetRoutes = require('./routes/budget');
const expenseRoutes = require('./routes/expense');

// Environment Setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// [SECTION] Database Connection
mongoose.connect(process.env.DB, 
{
	useNewUrlParser: true,
	useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// [SECTION] Backend Routes
app.use("/user",userRoutes);
app.use("/group",userGroupRoutes);
app.use("/budget",budgetRoutes);
app.use("/expense",expenseRoutes);

if(require.main === module){
	app.listen(process.env.PORT, () => {
		console.log(`API is now online on localhost:${ process.env.PORT}`)
	})
}

module.exports = {app, mongoose};