const bcrypt = require("bcrypt");
const userModel = require("../model/People.js");
const {
  addUser: addUserCURD,
  getAllUsers,
  removeUser: removeUserCURD,
} = require("../lib/user/userCrud.js");

async function getUsers(req, res, next) {
  try {
    const users = await getAllUsers((isError, err) => {
      if (isError) {
        next(err);
      }
    });

    res.render("users", {
      users: users,
    });
  } catch (err) {
    next(err);
  }
}

async function addUser(req, res, next) {
  let userObj = {};
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    userObj = {
      ...req.body,
      password: hashedPassword,
      avatar: req.files[0].filename,
    };
  } else {
    userObj = {
      ...req.body,
      password: hashedPassword,
    };
  }
  addUserCURD(userObj, (isErorr, err) => {
    if (isErorr) {
      res.status(500).json({
        errors: {
          common: {
            msg: "Unknown error",
          },
        },
      });
    } else {
      res.status(200).json({
        message: "User was added successfully!",
        errors: {},
      });
    }
  });
}

function removeUser(req, res, next) {
  removeUserCURD(req.params.id, (isError, err) => {
    if (isError) {
      res.status(500).json({
        errors: {
          common: {
            msg: "Could not delete the user",
          },
        },
      });
    } else {
      res.status(200).json({
        message: "user is removed successfully",
        errors: {},
      });
    }
  });
}

module.exports = {
  getUsers,
  addUser,
  removeUser,
};
