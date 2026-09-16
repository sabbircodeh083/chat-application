//external ipmort
const { render } = require("ejs");
const { check, validationResult } = require("express-validator");

const doLoginValidator = [
  check("username").trim().isLength({ min: 1 }).withMessage("name is required"),
  check("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("password is required"),
];

function doLoginValidationHandler(req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: mappedErrors,
    });
  }
}

module.exports = { doLoginValidator, doLoginValidationHandler };
