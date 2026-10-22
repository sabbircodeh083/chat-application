//external Import
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

//jinternal Import
const User = require("../model/People");

// get Login
function getLogin(req, res, next) {
  res.render("index.ejs");
}

//do login
async function login(req, res, next) {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    if (user && user.password) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password,
      );

      if (isValidPassword) {
        //prepare the user object to generate token
        const userObject = {
          userid: user._id,
          username: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "user",
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

        // set logged in user local identifier
        res.locals.loggedInUser = userObject;

        // redirect to inbox
        res.redirect("inbox");
      } else {
        throw createError("Login Faild!! please try again");
      }
    } else {
      throw createError("Login Faild!! please try again");
    }
  } catch (err) {
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
