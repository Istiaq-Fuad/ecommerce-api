const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require("../errors");
const { attachCookiesToResponse } = require("../utils/jwt");
const createUserToken = require("../utils/createUserToken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //first registered user is an admin
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const tokenUSer = createUserToken(user);

  attachCookiesToResponse({ res, user: tokenUSer });

  res.status(StatusCodes.CREATED).json({ tokenUSer });
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid credentials");
  }

  const tokenUSer = createUserToken(user);

  attachCookiesToResponse({ res, user: tokenUSer });

  res.status(StatusCodes.OK).json({ tokenUSer });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
  });
  res.status(StatusCodes.OK).json({ message: "user logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
