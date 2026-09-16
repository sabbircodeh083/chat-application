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
const { authHandler } = require("../middlerwares/common/authHandler");

//initial router
const router = express.Router();

//send get request
router.get("/", decorateHtmlRespose("Users"), authHandler, getUsers);

//send post request
router.post(
  "/",
  authHandler,
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser,
);

//send delete request
router.delete("/:id", authHandler, removeUser);

module.exports = router;
