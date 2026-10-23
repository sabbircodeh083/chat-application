//external Import
const express = require("express");

//internal Import
const {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controller/inboxController");
const decorateHtmlRespose = require("../middlerwares/common/decorateHtmlResponse");
const {
  authenticationHandler,
} = require("../middlerwares/common/authenticationHandler");
const attachmentUpload = require("../middlerwares/inbox/attachmentUpload");

const router = express.Router();

//get the inbox page
router.get("/", decorateHtmlRespose("Inbox"), authenticationHandler, getInbox);
//search user for create a conversation
router.post("/search", authenticationHandler, searchUser);
//create a new conversation for between participators
router.post("/conversation", authenticationHandler, addConversation);
//delete conversaton
router.delete(
  "/conversation/:conversationId",
  authenticationHandler,
  deleteConversation,
);
//get all messages
router.get("/messages/:conversationId", authenticationHandler, getMessages);
// send message
router.post("/message", authenticationHandler, attachmentUpload, sendMessage);

//exports the router
module.exports = router;
