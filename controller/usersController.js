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

//build the user from an allow-list so request bodies can never inject fields
//such as role or avatar; forcedRole is used by the public registration route
async function createUser(req, res, forcedRole) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userObj = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword,
    };

    if (forcedRole) {
      userObj.role = forcedRole;
    }

    if (req.files && req.files.length > 0) {
      userObj.avatar = req.files[0].filename;
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
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error",
        },
      },
    });
  }
}

function addUser(req, res, next) {
  return createUser(req, res, "admin");
}

function registerUser(req, res, next) {
  return createUser(req, res, "user");
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
  registerUser,
  removeUser,
};
