//external Import
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

//jinternal Import
const User = require("../model/people");

// get Login
function getLogin(req, res, next) {
  res.render("index.ejs");
}

//do login
async function login(req, res, next) {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.password }],
    });
    if (user && user.password) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password,
      );

      if (isValidPassword) {
        //prepare the user object to generate token
        const userObject = {
          username: user.name,
          email: user.email,
          mobile: user.mobile,
          role: "user",
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        //set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          signed: true,
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
        });

        //set user data and render inbox
        res.render("inbox", {
          loggedInUser: userObject,
        });
      } else {
        throw createError("Login Faild!! please try again");
      }
    } else {
      throw createError("Login Faild!! please try again");
    }
  } catch (err) {
    //todo
    console.log(err);
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.send("logged out");
}

module.exports = {
  getLogin,
  login,
  logout,
};
