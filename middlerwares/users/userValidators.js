const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const User = require("../../model/People");
const path = require("path");
const { unlink } = require("fs");

const addUserValidators = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " _" })
    .trim(),

  check("email")
    .isEmail()
    .withMessage("Invalid Email address")
    .trim()
    //the schema stores emails lowercase, so normalize here too or the
    //duplicate check below can miss an existing account
    .customSanitizer((value) => value.toLowerCase())
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError("Email is already regitered");
        }
      } catch (err) {
        throw createError(err);
      }
    }),

  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage("Invalid phone Number")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          throw createError("Mobile number is already registered");
        }
      } catch (err) {
        throw createError(err);
      }
    }),

  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol",
    ),
];

const addUserValidationHandler = (req, res, next) => {
  const error = validationResult(req);
  const mappedError = error.mapped();
  if (Object.keys(mappedError).length === 0) {
    next();
  } else {
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(
        path.join(__dirname, `../../public/uploads/avatars/${filename}`),
        (err) => {
          if (err) console.log(err);
        },
      );
    }
    res.status(400).json({
      errors: mappedError,
    });
  }
};

module.exports = { addUserValidators, addUserValidationHandler };
