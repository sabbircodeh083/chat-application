//external Import
const express = require("express");

//internal Import
const { getInbox } = require("../controller/inboxController");
const decorateHtmlRespose = require("../middlerwares/common/decorateHtmlResponse");
const { authHandler } = require("../middlerwares/common/authHandler");

const router = express.Router();

router.get("/", decorateHtmlRespose("Inbox"), authHandler, getInbox);

module.exports = router;
