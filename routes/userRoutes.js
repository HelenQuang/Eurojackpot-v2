const express = require("express");
const {
  getAllUsers,
  getSpecificUser,
  updateUser,
  createUser,
  deleteUser,
} = require("../controllers/userController");
const {
  signUp,
  logIn,
  protect,
  restrict,
  forgotPassword,
} = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
// router.route("/logout").get(logOut);
router.route("/forgotPassword").post(forgotPassword);
// router.route("/resetPassword/:token").patch(resetPassword);

router.use(protect);
router.route("/updateMyPassword").patch(updatePassword);
router.route("/me").get(getMe, getSpecificUser);
router.route("/updateMe").patch(uploadUserPhoto, resizeUserPhoto, updateMe);
router.route("/deleteMe").delete(deleteMe);

router.use(restrict);
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getSpecificUser).patch(updateUser).delete(deleteUser);

module.exports = router;
