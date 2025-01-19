const User = require("../models/User");
const UserGroup = require("../models/UserGroup");
const bcrypt = require('bcrypt');
const auth = require("../auth");
require("dotenv").config();
// [SECTION] Register a User. Create Initial Group
module.exports.registerUser = async (req,res) => {
	try {
        // Check if the email already exists in the database
        const existingEmail = await User.findOne({ email: req.body.email });
        const existingUsername = await User.findOne({username: req.body.username});
        if (existingEmail) {
            // Email is already in use, send a response to the client
            return res.status(409).send({
            	message: "Email already registered",
            	response: false
            });
        }
        if(existingUsername){
        	return res.status(409).send({
        		message:"Username already registered",
        		response:false
        	})
        }

        // Password Validation
        const isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if(!(isValid.test(req.body.password))){
            return res.status(422).send({
                message:"Password does not meet the required criteria",
                response:false
            })
        }
        // Email is not in use, proceed with user registration
        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            email: req.body.email,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, parseInt(process.env.SALT_ROUNDS))
        });
        // Save the new user to the database
        await newUser.save();
        // Create Initial Group containing Registered User

        let newUserGroup = new UserGroup({
            userIdArray:[newUser._id],
            owner: newUser._id
        });

        await newUserGroup.save();

        // Save ObjectId of UserGroup to User
        newUser = await User.findOneAndUpdate({email:req.body.email},{userGroupArray:[newUserGroup._id]},{
            new: true, // Return the updated user document
            runValidators: true, // Run schema validators
        });
        if(!newUser){
            return res.status(422).send({
                message:"User Group not added!",
                response: false
            });
        }
        await newUser.save();
        // User registration successful, send a success response to the client
        return res.status(201).send({
            message: "User Registered Successfully",
            response: true
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).send({
            message: "Internal Server Error",
            response:false
        });
    }
};

// [SECTION] Logs in a registered User.
module.exports.loginUser = async (req, res) => {
  try {

    // Login Validation
    if(!req.body.email){
        return res.status(400).send({
            message:"Please enter email/username",
            response:false
        })
    }
    if(!req.body.password){
        return res.status(400).send({
            message:"Please enter password",
            response:false
        })
    }

    // Find if User exists via email or username
    const registeredUser = await User.findOne({
        $or: [
            { email: req.body.email },
            { username: req.body.email } // Assuming 'email' contains username too
        ]
    });

    if (registeredUser === null) {
      return res.status(401).send({
        message:"User is not registered!",
        response: false
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      registeredUser.password
    );

    if (isPasswordCorrect) {
      return res.status(200).send({
        message: "Login Successful!",
        response: true,
        access: auth.createAccessToken(registeredUser)
      });

    } else {
      return res.status(401).send({
        message:"Password is incorrect",
        response: false,
        access:undefined
    });
    }
  } catch (err) {
    return res.status(500).send({
        message: "Internal Server Error",
        response: false
    });
  }
};

// [SECTION] Get Profile Details (COMMON USER)
module.exports.getDetails = async (req,res) => {
	try {
        // Validate Bearer Token
        if(!req.user.id){
            return res.status(401).send({
                message:"You have no bearer token!",
                response: false,
                data: null
            });
        }
        // Fetch User using bearer token
        let user = await User.findById(req.user.id);
        // Validate user
        if(!user){
            return res.status(404).send({
                message:"No user found",
                response: false,
                data:null
            })
        }
        // Store in Object
        let details = {
            userId: req.user.id,
            firstName:user.firstName,
            lastName:user.lastName,
            age:user.age,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
            createdAt:user.createdAt
        }
        
        return res.status(201).send({
            message:"Profile Details Retrieved!",
            response: true,
            data:details
        });
    } catch(err){
        res.status(500).send({
            message:"Internal Server Error",
            response: false,
            data: err
        });
    }
};
// [SECTION] Edit Profile
module.exports.editProfile = async (req,res) => {
    try{
        // Check if username exists
        let doesUsernameExist = await User.findOne({
            $and: [
                { username: req.body.username },
                { email: { $ne: req.body.email } } // Exclude the current email
            ]
        });
        if(doesUsernameExist){
            return res.status(409).send({
                message:"Username already exists",
                response:false,
                data:null
            })
        }
        let updatedDetails = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            username: req.body.username,
            updatedAt:Date.now()
        }
        // Validate bearer token
        if(!req.user.id){
            return res.status(401).send({
                message:"You have no bearer token!",
                response: false,
                data: null
            });
        }
        // Fetch User using bearer token
        const user = await User.findByIdAndUpdate(req.user.id, updatedDetails, {
            new: true, // Return the updated user document
            runValidators: true, // Run schema validators
        });
        if(!user){
            return res.status(404).send({
                message:"No user found",
                response: false,
                data:null
            })
        }
        return res.status(200).send({
            message:"Profile Updated Successfully!",
            response:true,
            data: user
        })
    } catch(err){
        res.status(500).send({
            message:"Internal Server Error",
            response: false,
            data: err
        });
    }
}
// [SECTION] Change Password
module.exports.changePassword = async(req,res) => {
    try{
        // Fetch User Data
        let user = await User.findById(req.user.id);
        if(!user){
            return res.status(409).send({
                message:"No such User!",
                response:false,
                data:null
            })
        }
        // Check currentPassword if matching
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.currentPassword,
            user.password
          );
        if(!isPasswordCorrect){
            return res.status(409).send({
                message: "Current Password does not match",
                response:false,
                data:null
            })
        }
        const isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if(!(isValid.test(req.body.newPassword))){
            return res.status(422).send({
                message:"New password does not meet the required criteria",
                response:false
            })
        }
        user = await User.findByIdAndUpdate(req.user.id,{password:bcrypt.hashSync(req.body.newPassword, parseInt(process.env.SALT_ROUNDS))},{
            new:true,
            runValidators:true
        });
        if(!user){
            return res.status(404).send({
                message:"Password not updated!",
                response: false,
                data:null
            })
        }
        return res.status(200).send({
            message:"Password Updated Successfully!",
            response:true,
            data: null
        })
    } catch(err){
        res.status(500).send({
            message:"Internal Server Error",
            response: false,
            data:err
        })
    }
}
// [SECTION] Get Groups of COMMON USER
module.exports.getGroups = async(req,res) => {
    try{
        // Get User
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(409).send({
                message:"User not found!",
                reponse:false,
                data:null
            })
        }
        return res.status(200).send({
            message:`${user.firstName} ${user.lastName}'s Groups`,
            reponse:true,
            data:user.userGroupArray
        })
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            response:false,
            data:error
        })
    }
}
// SHOULD FIX DATES TO DISPLAY GMT+8
