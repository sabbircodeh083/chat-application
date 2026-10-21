const createError = require("http-errors");

//404 not found handler
function notFoundHandler(req, res, next) {
  next(createError(404, "Requested page in not found"));
}

//default error handler
function errorHandler(err, req, res, next) {
  //todo
  console.log(err);
  res.locals.error = process.env.NODE_ENV === "development" ? err : err.message;
  res.status(err.status || 500);
  if (res.locals.html) {
    //html response
    res.render("error", {
      title: "Error-Page",
    });
  } else {
    //json response
    res.json(res.locals.error);
  }
}

module.exports = { notFoundHandler, errorHandler };
