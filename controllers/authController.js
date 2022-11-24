const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/emailHandler");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password"); //Have to select back the password to compare bc we deselect password in the model

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("Incorrect email or password. Please try again", 401)
    );
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to get access to this page",
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The token belongs to this user has no access", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User has recently changed password. Please log in again.",
        401
      )
    );
  }

  req.user = currentUser;

  next();
});

exports.restrict = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to do this action", 403)
    );
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("No user with this email address. Please try again!", 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n`;

  // try {

  //   await new Email(user, resetURL).sendPasswordReset();

  //   res.status(200).json({
  //     status: "success",
  //     message: "Token sent to user email!",
  //   });
  // } catch (err) {
  //   user.passwordResetToken = undefined;
  //   user.passwordResetExpires = undefined;

  //   await user.save({ validateBeforeSave: false });

  //   return next(
  //     new AppError(
  //       "There was an error sending the email. Try again later!",
  //       500
  //     )
  //   );
  // }
});

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1. Get user based on token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2. If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }

//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;

//   //3. Update changePasswordAt property => fn in userModel
//   await user.save();

//   //4. Log the user in and send JWT
//   createAndSendToken(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   //1. Get user
//   const user = await User.findById(req.user.id).select("+password");

//   //2. Check if posted password is correct
//   if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError("Incorrect password", 401));
//   }

//   //3. Update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;

//   await user.save();

//   //4. Log user in and send JWT
//   createAndSendToken(user, 200, res);
// });
