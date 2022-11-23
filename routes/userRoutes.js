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
} = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);

router.use(protect);
router.use(restrict);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getSpecificUser).patch(updateUser).delete(deleteUser);

module.exports = router;
