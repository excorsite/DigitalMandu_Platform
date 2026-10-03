const User = require("../../../models/userModel");

exports.getUserCount = async (req, res) => {
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
  return res.status(200).json({ data: { totalUsers } });
};

exports.getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await User.find({
      _id: { $ne: userId },
      role: req.user.role === "seller" ? "customer" : { $ne: "admin" },
    }).select("-password -role -otp -isOtpVerified");
    return res.status(200).json({
      message: users.length ? "users found" : "no users found",
      userData: users,
    });
  } catch (e) {
    return res.status(500).json({
      message: "an error occured",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: "user id is required" });
  }
  const userFound = await User.findById(userId);
  if (!userFound) {
    return res.status(404).json({ message: "user not found" });
  }

  if (
    userFound.role === "admin" ||
    String(userFound._id) === String(req.user.id)
  ) {
    return res.status(403).json({ message: "This user cannot be deleted" });
  }

  if (req.user.role === "seller" && userFound.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Sellers can only delete customers" });
  }

  await User.findByIdAndDelete(userId);
  return res.status(200).json({
    message: `Successfully deleted user ${userId}`,
  });
};
