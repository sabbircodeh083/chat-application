//external import
const JWT = require("jsonwebtoken");
//internal import

function authHandler(req, res, next) {
  //
  const cookies = req.signedCookies;
  if (Object.keys(cookies).length > 0 && cookies[process.env.COOKIE_NAME]) {
    //parse the token
    const token = cookies[process.env.COOKIE_NAME];
    //verify the token and parse object payload
    const userPayload = JWT.verify(token, process.env.JWT_SECRET);
    if (userPayload && userPayload.username) {
      // check for html response
      if (res.locals.html) {
        //set payload for html response
        res.locals.loggedInUser = userPayload;
      }
      //forword the response for next middleware
      next();
    } else {
      // if token is tampered
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(500).json({
          errors: {
            common: {
              msg: "Authentication Failure",
            },
          },
        });
      }
    }
  } else {
    //if token is not exist
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(401).json({
        errors: {
          common: {
            msg: "Authentication Failure",
          },
        },
      });
    }
  }
}

function allreadyAuthorizedHandler(req, res, next) {
  if (
    Object.keys(req.signedCookies).length > 0 &&
    Object.keys(req.signedCookies[process.env.COOKIE_NAME])
  ) {
    if (res.locals.html) {
      res.redirect("/inbox");
    } else {
      res.status(400).json({
        errors: {
          common: {
            msg: "User is already Authenticated",
          },
        },
      });
    }
  } else {
    next();
  }
}

module.exports = {
  authHandler,
  allreadyAuthorizedHandler,
};
