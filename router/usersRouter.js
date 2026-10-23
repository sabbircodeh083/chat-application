//external import
const express = require("express");

//internal import
const {
  getUsers,
  addUser,
  removeUser,
} = require("../controller/usersController");
const decorateHtmlRespose = require("../middlerwares/common/decorateHtmlResponse");
const avatarUpload = require("../middlerwares/users/avatarupload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlerwares/users/userValidators");
const {
  authenticationHandler,
  authorizationHandler,
} = require("../middlerwares/common/authenticationHandler");

//initial router
const router = express.Router();

//send get request
router.get(
  "/",
  decorateHtmlRespose("Users"),
  authenticationHandler,
  authorizationHandler,
  getUsers,
);

//send post request
router.post(
  "/",
  authenticationHandler,
  authorizationHandler,
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser,
);

//send delete request
router.delete("/:id", authenticationHandler, authorizationHandler, removeUser);

module.exports = router;
