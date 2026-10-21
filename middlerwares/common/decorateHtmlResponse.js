const { model } = require("mongoose");

function decorateHtmlRespose(page_title) {
  return function (req, res, next) {
    // never let the browser serve a stale copy of a rendered page
    res.set("Cache-Control", "no-store");
    res.locals.title = `${page_title}- Chating App`;
    res.locals.html = true;
    res.locals.loggedInUser = {};
    res.locals.errors = {};
    res.locals.Cdata = [];
    res.locals.data = {};
    next();
  };
}

module.exports = decorateHtmlRespose;
