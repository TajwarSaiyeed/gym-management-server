const asyncHandler = require("express-async-handler");
const Message = require("../models/message.Model");
const User = require("../models/user.Model");
const Chat = require("../models/chat.Model");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400);
  }

  let newMessage = {
    sender: req.decoded._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name image email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name image email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    return res.status(201).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name image email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
