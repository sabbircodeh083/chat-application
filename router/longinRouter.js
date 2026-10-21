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
  allreadyAuthenticatedHandler,
} = require("../middlerwares/common/authenticationHandler");
const { getInbox } = require("../controller/inboxController");

const router = express.Router();

router.get(
  "/",
  decorateHtmlRespose("Login"),
  allreadyAuthenticatedHandler,
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
