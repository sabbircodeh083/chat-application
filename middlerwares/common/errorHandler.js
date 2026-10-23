const createError = require("http-errors");

//404 not found handler
function notFoundHandler(req, res, next) {
  // include method + url: without them the stack trace below is useless,
  // because every unmatched request looks exactly the same
  next(createError(404, `${req.method} ${req.originalUrl} is not found`));
}

//default error handler
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    // real server errors deserve the full stack
    console.error(err);
  } else {
    // 4xx means the client asked for something we do not serve (missing page,
    // wrong HTTP method, favicon...). One line is enough - do not print a stack
    console.warn(`${status} ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  res.locals.error = process.env.NODE_ENV === "development" ? err : err.message;
  res.status(status);
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
