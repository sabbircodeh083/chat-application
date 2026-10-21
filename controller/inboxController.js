//external Import

const createError = require("http-errors");

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
    });

    res.locals.Cdata = conversations;
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
    const messages = await messageModel
      .find({
        conversation_id: req.params.conversationId,
      })
      .sort("-createdAt");
    const { participant } = await Conversation.findById(
      req.params.conversationId,
    );

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
          msg: "Unknows error occured!",
        },
      },
    });
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

      // emit socket event todo

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
};
