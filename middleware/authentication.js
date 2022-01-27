const { UnauthenticatedError, UnauthorizedError } = require("../errors");
const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError("authentication invalid");
  }
  try {
    const { name, userId, role } = isTokenValid(token);
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication invalid");
  }
};

const authorizePermission = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("unauthorized to access the route");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermission };
