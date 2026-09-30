const User = require("../../../models/userModel");

exports.getUserCount = async (req, res) => {
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
  return res.status(200).json({ data: { totalUsers } });
};

exports.getUsers = async (req, res) => {
  try {
    //  removing the sensitive information
    // $ne = admin is indicating the user with data not = admin
    //also data of usefr operating will also be not hsown
    const userId = req.user.id;
    const users = await User.find({
      _id: { $ne: userId },
      role: { $ne: "admin" },
    }).select("-password -role -otp -isOtpVerified");
    if (users.length < 1) {
      res.status(404).json({
        message: "no users found",
        userData: [],
      });
    } else {
      res.status(200).json({
        message: "users found",
        userData: users,
      });
    }
  } catch (e) {
    res.status(400).json({
      message: "an error occured",
    });
    console.log(e);
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({
      message: "you need to login as an admin the system didnt get your id",
    });
  }
  const userFound = await User.findById(userId);
  if (!userFound) {
    res.status(400).json({
      message: "the user with this id is not found in the databse",
    });
  } else {
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      message: "Successfully deleted an user with ID" + userId,
    });
  }
};
