const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please tell us your name"] },
  email: {
    type: String,
    required: [true, "Please provide us your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide us a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    require: [true, "Please provide us your password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  transaction: [
    {
      amount: {
        type: Number,
        required: [true, "Please choose the amount you want to top up"],
        min: 10,
      },
      paidAt: Date,
    },
  ],
  active: { type: Boolean, default: true, select: false },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;