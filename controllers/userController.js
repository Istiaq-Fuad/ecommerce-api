const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors");
const User = require("../models/User");
const checkPermission = require("../utils/checkPermission");
const createUserToken = require("../utils/createUserToken");
const { attachCookiesToResponse } = require("../utils/jwt");

const getAllUser = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new NotFoundError("User doesn't exist");
  }

  checkPermission(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

//update user with user.save()
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new BadRequestError("please provide all values");
  }

  const user = await User.findById(req.user.userId);
  // const user = await User.findByIdAndUpdate(
  //   req.user.userId,
  //   { name, email },
  //   { new: true, runValidators: true }
  // );

  user.name = name;
  user.email = email;

  await user.save();

  const tokenUser = createUserToken(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("please provide both values");
  }

  const user = await User.findById(req.user.userId);
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid credentials");
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ message: "Success! password changed" });
};

module.exports = {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
