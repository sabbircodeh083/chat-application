//external import
const express = require("express");

//internal import
const { getLogin, login, logout } = require("../controller/loginController");
const decorateHtmlRespose = require("../middlerwares/common/decorateHtmlResponse");
const {
  doLoginValidator,
  doLoginValidationHandler,
} = require("../middlerwares/login/loginValidator");
const {
  allreadyAuthorizedHandler,
} = require("../middlerwares/common/authHandler");

const router = express.Router();

router.get(
  "/",
  decorateHtmlRespose("Login"),
  allreadyAuthorizedHandler,
  getLogin,
);

router.post(
  "/",
  decorateHtmlRespose("Login"),
  doLoginValidator,
  doLoginValidationHandler,
  login,
);

router.delete("/", logout);

module.exports = router;
