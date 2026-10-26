//external Import

const createError = require("http-errors");
const { unlink } = require("fs");
const path = require("path");

//internal Import
const User = require("../model/People");
const Conversation = require("../model/Conversation");
const escape = require("../utilites/escape");
const messageModel = require("../model/Message");

async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    })
      .sort({ last_update: -1 })
      .lean();

    // attach the latest message to each conversation so the sidebar can show
    // a preview without a query per row
    const conversationIds = conversations.map((conversation) => conversation._id);
    let lastMessageByConversation = new Map();

    if (conversationIds.length > 0) {
      const lastMessages = await messageModel.aggregate([
        { $match: { conversation_id: { $in: conversationIds } } },
        { $sort: { date_time: -1 } },
        {
          $group: {
            _id: "$conversation_id",
            text: { $first: "$text" },
            attachment: { $first: "$attachment" },
            sender: { $first: "$sender" },
            date_time: { $first: "$date_time" },
          },
        },
      ]);

      lastMessageByConversation = new Map(
        lastMessages.map((message) => [String(message._id), message]),
      );
    }

    res.locals.Cdata = conversations
      .map((conversation) => ({
        ...conversation,
        last_message: lastMessageByConversation.get(String(conversation._id)) || null,
      }))
      .sort((a, b) => {
        const aDate = a.last_message?.date_time || a.last_update;
        const bDate = b.last_message?.date_time || b.last_update;
        return new Date(bDate) - new Date(aDate);
      });

    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

//serach user
async function searchUser(req, res, next) {
  //parse requested user
  const user = req.body.user;
  //cutoff +88 from number for make search comfortable
  const searchQuery = user.replace("+88", "");

  //make reguler expression for search and escape epecial chat
  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$");

  try {
    if (searchQuery !== "") {
      //perform search
      const users = await User.find(
        {
          $or: [
            { name: name_search_regex },
            { email: email_search_regex },
            { mobile: mobile_search_regex },
          ],
        },
        "name avatar",
      );
      if (users.length > 0) {
        //send user
        res.status(200).json(users);
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "There is no user for this search",
            },
          },
        });
      }
    } else {
      throw createError("Invalid search");
    }
  } catch (err) {
    //response error json
    res.status(500).json({
      errors: {
        common: {
          msg: "server Error",
        },
      },
    });
  }
}

async function addConversation(req, res, next) {
  //set all data to add a new conversation
  const data = {
    creator: {
      id: req.user.userid,
      name: req.user.username,
      avatar: req.user.avatar || null,
    },
    participant: {
      id: req.body.participant_id,
      name: req.body.participant_name,
      avatar: req.body.participant_avatar || null,
    },
  };

  try {
    const newConversation = new Conversation(data);

    const result = await newConversation.save();
    res.status(200).json({
      message: "Conversation was added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: " add conversation failed because of Server Error",
        },
      },
    });
  }
}

//get all messages
async function getMessages(req, res, next) {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId,
    ).lean();

    if (!conversation) {
      return res.status(404).json({
        errors: {
          common: {
            msg: "Conversation not found",
          },
        },
      });
    }

    const messages = await messageModel
      .find({
        conversation_id: req.params.conversationId,
      })
      .sort("-date_time");

    // the logged-in user may be either the creator or the participant; always
    // return the *other* person so the chat header shows the right avatar
    const isCreator =
      String(conversation.creator.id) === String(req.user.userid);
    const participant = isCreator
      ? conversation.participant
      : conversation.creator;

    res.status(200).json({
      data: {
        messages,
        participant,
      },
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occurred!",
        },
      },
    });
  }
}

//delete conversation

async function deleteConversation(req, res, next) {
  try {
    const conversationId = req.params.conversationId;

    //Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        errors: {
          common: "Conversation not found!",
        },
      });
    }

    // Find all messages belonging to the conversation
    const allMessages = await messageModel.find({
      conversation_id: conversationId,
    });

    //Delete attachments associated with each message
    for (const message of allMessages) {
      if (message.attachment?.length > 0) {
        for (const item of message.attachment) {
          const filePath = path.join(
            __dirname,
            "../public/uploads/attachments",
            item,
          );

          unlink(filePath, (err) => {
            if (err) console.log(err);
          });
        }
      }
    }

    // Delete all messages belonging to the conversation
    await messageModel.deleteMany({
      conversation_id: conversationId,
    });

    //Delete the conversation itself
    const result = await Conversation.deleteOne({
      _id: conversationId,
    });

    if (result.acknowledged && result.deletedCount === 1) {
      return res.status(200).json({
        message: "Conversation deleted successfully!",
      });
    }

    return res.status(500).json({
      errors: {
        common: "Conversation deletion failed!",
      },
    });
  } catch (err) {
    next(err);
  }
}

//send new message
async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in database
      let attachments = null;

      if (req.files && req.files.length > 0) {
        attachments = [];

        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }

      const newMessage = new messageModel({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.avatar || null,
        },
        conversation_id: req.body.conversationId,
      });

      const result = await newMessage.save();

      // keep the conversation list ordered by the latest activity
      try {
        await Conversation.findByIdAndUpdate(req.body.conversationId, {
          last_update: result.date_time,
        });
      } catch (updateErr) {
        console.error(
          "Could not update conversation timestamp:",
          updateErr.message,
        );
      }

      // emit socket event

      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userid,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: result.date_time,
        },
      });

      res.status(200).json({
        message: "Successful!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: "message text or attachment is required!",
      },
    });
  }
}

module.exports = {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
  deleteConversation,
};
