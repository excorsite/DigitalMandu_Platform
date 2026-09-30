const User = require("../../../models/userModel");
const hx = require("bcryptjs");

//get my profile controller

exports.getMyProfile = async (rq, rs) => {
  const userID = rq.user.id;
  const myProfile = await User.findById(userID).select("-password -otp");
  if (!myProfile) {
    return rs.status(404).json({ message: "User not found" });
  }
  return rs.json({
    message: "Found the data",
    data: myProfile,
  });
};

// Updating the password of a user
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userID = req.user.id;

  try {
    // Check if all fields are filled
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify that the old password matches the one in the database
    const isPasswordMatch = await hx.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Ensure the new password is not the same as the old password
    const isSamePassword = await hx.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password",
        });
    }

    // Check if new password and confirm password match
    if (newPassword.trim() !== confirmPassword.trim()) {
      return res
        .status(400)
        .json({ message: "New password and confirmed password do not match" });
    }

    // Hash the new password
    const hashedPassword = await hx.hash(newPassword, 12);

    // Update the user's password directly in the database
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Failed to update the password. Please try again." });
    }

    // Optional: Clear user tokens or sessions (example implementation below)
    await expireToken(req);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({
        message: "An internal server error occurred. Please try again.",
      });
  }
};

//update my profile controller
exports.updateProfile = async (req, res) => {
  const { userName, userEmail, userPhone } = req.body;
  const userID = req.user.id;

  // Updating user data by finding the data from id and setting new data
  const updatedUser = await User.findByIdAndUpdate(
    userID,
    {
      $set: {
        name: userName,
        email: userEmail,
        phone: userPhone,
      },
    },
    { new: true, runValidators: true },
  );
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({
    message: "Profile updated successfully",
    data: updatedUser,
  });
};

// Function to expire the token
const expireToken = async (req) => {
  try {
    // Example token invalidation logic:
    req.user.token = null;

    // Add token invalidation/blacklist logic here if applicable
    console.log("User token invalidated");
  } catch (error) {
    console.error("Error expiring token:", error);
  }
};

//delete my profile contorller
exports.deleteProfile = async (req, res) => {
  const userID = req.user.id;
  const deletedUser = await User.findByIdAndDelete(userID);
  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ message: "Profile deleted successfully" });
};
