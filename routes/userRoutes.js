const express = require("express");
const {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");
const router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin", "user"), getAllUser);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updatePassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
