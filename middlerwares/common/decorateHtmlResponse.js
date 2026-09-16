const { model } = require("mongoose");

function decorateHtmlRespose(page_title) {
  return function (req, res, next) {
    res.locals.title = `${page_title}- Chating App`;
    res.locals.html = true;
    res.locals.loggedInUser = {};
    res.locals.errors = {};
    res.locals.data = {};
    next();
  };
}

module.exports = decorateHtmlRespose;
