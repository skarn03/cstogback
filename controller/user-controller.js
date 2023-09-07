const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../Model/user-model");

class UserController {
    static signup = async (req, res) => {
        try {
            //checking validation results from express-validator middleware
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }
            // Get userData from the request body
            const { name, DOB, email, password } = req.body;

            // Check if user with the same email already exists
            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                // User with the same email already exists
                throw new Error("User Already Exists , Log In instead");
            }

            //hashing password;
            const hashedPassword = await bcrypt.hash(password, 12);
            // Create a new user instance
            const newUser = new User({
                name,
                DOB,
                email,
                password: hashedPassword,
            });


            //token for local storage
            const token = jwt.sign({
                userID: newUser.id,
                email: newUser.email
            }, process.env.JWT_KEY,
                {
                    expiresIn: '24h'
                });
            if (!token) {
                throw new Error("Signing Up Failed ,Please Try again Later")
            }
            // Save the new user to the database
            const recent = await newUser.save();
            if (!recent) {
                throw new Error("Signing Up Failed ,Please Try again Later");
            }

            res.status(200).json
                ({
                    user: {
                        id: newUser.id
                    }, token: token, message: "Sign up Successful"
                });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static login = async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {

                throw new Error("Missing Details");
            }

            const { email, password } = req.body;

            //check if the user does have account
            const existingUser = await User.findOne({ email: email });
            if (!existingUser) {
                throw new Error("Invalid Credentials");
            }
            //check if the password is correct;
            const isValidPassword = await bcrypt.compare(password, existingUser.password);
            if (!isValidPassword) {
                throw new Error("Invalid Credentials");
            }
            //checking if the user is verified or not
            // if(!existingUser.verified){
            //     throw new Error("Please verify your email");
            // }
            //creating a localstorage jwt token
            const token = jwt.sign({
                userID: existingUser.id,
                email: existingUser.email
            }, process.env.JWT_KEY,
                {
                    expiresIn: '24h'
                });
            if (!token) {
                throw new Error("Can't Login , Please Try again later")
            }
            //sending a success response
            res.status(200).json({
                user: {
                    id: existingUser.id
                },
                message: "logged in",
                token: token
            })

        } catch (error) {

            console.error('Error in login:', error.message);
            res.status(500).json({ message: error.message });
        }
    }
    static getUserWithProjects = async (req, res) => {
        try {
            const userId = req.params.userId; // Assuming userId is passed in the request parameters

            // Find the user and populate the 'projects' field, selecting only desired fields
            const userWithProjects = await User.findById(userId)
                .select('-email -password') // Exclude email and password
                .populate('projects');

            if (!userWithProjects) {
                throw new Error("User not found");
            }

            res.status(200).json({ user: userWithProjects });
        } catch (error) {
            console.error('Error in getUserWithProjects:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static getUserSettings = async (req, res) => {
        try {
            const userId = req.params.userId; // Assuming userId is passed in the request parameters

            // Find the user and populate the 'projects' field, selecting only desired fields
            const userWithProjects = await User.findById(userId)
                .select('-projects -password') // Exclude email and password

            if (!userWithProjects) {
                throw new Error("User not found");
            }

            res.status(200).json({ user: userWithProjects });
        } catch (error) {
            console.error('Error in getUserWithProjects:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static updateUserSettings = async (req, res) => {
        try {
            const userId = req.userData.userID; // Assuming userId is passed in the request parameters
            const { name, DOB, email, newPassword, confirmNewPassword, oldPassword } = req.body;

            // Find the user by ID
            const user = await User.findById(userId);

            if (!user) {
                throw new Error("User not found");
            }

            // If changing email, verify old password and validate new email
            if (email && email !== user.email) {
                const isValidPassword = await bcrypt.compare(oldPassword, user.password);

                if (!isValidPassword) {
                    throw new Error("Invalid old password");
                }

                if (!emailValidator.validate(email)) {
                    throw new Error("Invalid email format");
                }

                // Check if email is already taken
                const existingUserWithEmail = await User.findOne({ email: email });

                if (existingUserWithEmail) {
                    throw new Error("Email is already in use");
                }
            }

            // If changing password, verify old password and validate new password
            if (newPassword && confirmNewPassword) {
                const isValidPassword = await bcrypt.compare(oldPassword, user.password);

                if (!isValidPassword) {
                    throw new Error("Invalid old password");
                }

                if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*.-])(?=.{8,32})/.test(newPassword)) {
                    throw new Error("Password must contain at least one uppercase letter, one special character (!@#$%^&*.-), and be 8-32 characters long");
                }

                if (newPassword !== confirmNewPassword) {
                    throw new Error("New passwords do not match");
                }

                const hashedPassword = await bcrypt.hash(newPassword, 12);
                user.password = hashedPassword;
            }

            // Update user fields
            if (name) user.name = name;
            if (DOB) user.DOB = DOB;
            if (email) user.email = email;

            // Save updated user
            const updatedUser = await user.save();

            res.status(200).json({ user: updatedUser, message: "User settings updated" });
        } catch (error) {
            console.error('Error in updateUserSettings:', error.message);
            return res.status(400).json({ message: error.message });
        }
    }
}
module.exports = UserController;
