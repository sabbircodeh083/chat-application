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
const avatarUpload = require("../middlerwares/users/avatarupload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlerwares/users/userValidators");
const { registerUser } = require("../controller/usersController");

const router = express.Router();

//public registration used by the login page modal
router.post(
  "/register",
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  registerUser,
);

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
