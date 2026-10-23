//external import
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
//internal import

function authenticationHandler(req, res, next) {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      let token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // pass user info to response locals
      if (res.locals.html) {
        res.locals.loggedInUser = decoded;
      }
      next();
    } catch (err) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "Authentication failure!",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(401).json({
        errors: {
          common: {
            msg: "Authentication failure!",
          },
        },
      });
    }
  }
}

function allreadyAuthenticatedHandler(req, res, next) {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (!cookies) {
    next();
  } else {
    res.redirect("/inbox");
  }
}

function authorizationHandler(req, res, next) {
  //allowed rules
  const role = ["admin"];

  if (req.user.role && role.includes(req.user.role.toLowerCase())) {
    next();
  } else {
    if (res.locals.html) {
      next(createError(401, "You are not authorized to access this page"));
    } else {
      res.status(401).json({
        errors: {
          common: {
            msg: "You are not authorized!",
          },
        },
      });
    }
  }
}

module.exports = {
  authenticationHandler,
  allreadyAuthenticatedHandler,
  authorizationHandler,
};
