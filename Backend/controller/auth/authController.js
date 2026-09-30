// we are actually supposed to import bcrypt to use it for hashing passwords
const hx = require('bcryptjs')

//require jsonwebtoken for using it to login the user
const webtoken = require('jsonwebtoken');

// Import the User model
const User = require("../../models/userModel");
const sendEmail = require('../../services/sendEmail');




exports.registerUser = async (req, res) => {
    // Log received request body
    console.log("Received registration data:", req.body);
    
    // Destructure the JSON form data
    const { userEmail, userName, userPhone, userPassword } = req.body;

    // Check for empty fields
    if (!userEmail || !userPhone || !userName || !userPassword) {
        console.log("Missing required fields");
        return res.status(400).json({
            message: "User creation failed"
        });
    } else {
        try {
            // Check if a user with the same email already exists
            const existingUser = await User.findOne({ email: userEmail });
            console.log("Existing user check result:", existingUser);
            
            if (existingUser) {
                return res.status(400).json({
                    message: "User with given email already exists"
                });
            }

            // Create a new user
            const data = await User.create({
                email: userEmail,
                name: userName,
                phone: userPhone,
                password: hx.hashSync(userPassword, 10) // Hash password
            });

            console.log("User created successfully:", data);

            // Send success message
            res.status(201).json({
                message: "User created successfully",
                data: data
            });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({
                message: "Error creating user",
                error: error.message
            });
        }
    }
};

exports.loginUser = async (req, res) => {
    // Log received request body
    console.log("Received login data:", req.body);
    
    // Destructure the user email and password
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
        console.log("Missing login credentials");
        return res.status(400).json({
            message: "Please enter your email and password to login"
        });
    }

    try {
        // Find the user with the given email
        const user = await User.findOne({ email: userEmail });
        console.log("User lookup result:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        } else {
            // Compare given password with stored hashed password
            const isValidPassword = hx.compareSync(userPassword, user.password);
            console.log("Password validation result:", isValidPassword);

            if (isValidPassword) {
                const token = webtoken.sign(
                    { id: user._id.toString() },
                    process.env.SECRET_KEY,
                    { expiresIn: '30d', algorithm: 'HS256' }
                );
                console.log("Generated token:", token);

                res.status(200).json({
                    message: "Login successful",
                    data: user,
                    token: token
                });
            } else {
                console.log("Invalid password");
                res.status(401).json({ message: "Invalid password" });
            }
        }
    } catch (err) {
        console.error("Error in database:", err);
        res.status(500).json({ message: "Error in database" });
    }
};



// forgot password feature implementation
exports.forgotPassword = async (req, res) => {
    const { userEmail } = req.body;
    if (!userEmail) {
        // returning 400 status message for requesting user to give email
        return res.status(400).json({
            message: "Please enter your email to reset password"
        });
    }

    // checking if user email given is available in database 
    const emailExists = await User.findOne({ email: userEmail });
    if (!emailExists) {
        // returning 404 status message for user not found
        return res.status(404).json({
            message: "User not found"
        });
    } else {
        // creating otp with 4 digits 
        const otpUser = Math.floor(1000 + Math.random() * 9000);
        // as we give user the OTP we save it to verify them by storing them in db
        emailExists.otp = otpUser;
        await emailExists.save()
        try {
          await sendEmail({
              userEmail: userEmail,
              emailSubject: "Password Reset OTP for Digital Mandu",
              emailMessage: `Your OTP for password reset is ${otpUser}`,
          });
        } catch (mailErr) {
          console.warn("Email send failed (dev fallback), OTP:", otpUser, mailErr.message);
        }
        console.log(`[DEV OTP] ${userEmail} -> ${otpUser}`);
        const isDev = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'dev@example.com';
        return res.json({
            message: isDev ? `OTP sent (dev mode): ${otpUser}` : "Successfully sent message",
            ...(isDev ? { otp: otpUser } : {})
        });
    }
};


// verify user Given and system sent OTP 
exports.verifyOTP = async (req, res) => {
    // taking email and otp from user input
    const { userEmail, otpUser } = req.body;

    // checking if otp and email is not null, if null send status code 400
    if (!userEmail || !otpUser) {
        return res.status(400).json({
            message: "Please enter your email and OTP to verify"
        });
    }

    // finding the user with the given email in the db
    const user = await User.findOne({ email: userEmail });

    if (!user) {
        // invalid message in case of unidentified email
        return res.status(400).json({
            message: "No account with that email"
        });
    } else if (user.otp !== otpUser) {
        // returning 400 status message for invalid OTP
        return res.status(400).json({
            message: "Invalid OTP"
        });
    } else {
        // OTP is correct
        // Reset OTP to undefined in the database for one-time usage
        user.otp = undefined;
    
        // Mark the user as verified
        user.isOtpVerified = true;
    
        // Save the updated user object
        await user.save();
    
        // Respond with success
        return res.status(200).json({ message: "OTP is correct!" });
    }
    
}

// resetting the pasword afterforgeting in this endpoint we hit then we changet 
// the current password with user given passwword by using the otp verification from 
//avobe
exports.resetPassword = async (req, res) => {
    try {
        // taking email and new password from user input
        const { userEmail, newUserPassword, confirmUserPassword } = req.body;

        // checking if userEmail, newUserPassword, and confirmUserPassword are not null
        if (!userEmail || !newUserPassword || !confirmUserPassword) {
            return res.status(400).json({
                message: "Enter details in the field"
            });
        }

        // finding the user with the given email in the db
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(400).json({
                message: "No account with that email"
            });
        }

        // checking if new password is confirmed
        if (confirmUserPassword !== newUserPassword) {
            return res.status(400).json({
                message: "Please confirm your password by entering the new password twice"
            });
        }

        // checking if new password is not equal to old password (use password comparison logic)
        const isSamePassword = hx.compareSync(newUserPassword, user.password); // Compare hashed password
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password cannot be the same as old password"
            });
        }
        if (user.isOtpVerified !== true) {
            // if user trying to verify again or trying to access unethical way
            // show error
            return res.status(403).json({ message: "You cannot perform this action" });
        }
        // updating the user password with the new password
        user.password = hx.hashSync(newUserPassword, 10);
        // turn off the otp before saving  thae updated
        user.isOtpVerified = false;
        await user.save();

        // sending success response
        return res.status(200).json({
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred. Please try again later."
        });
    }
};
