const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/message.Controllers");

const router = express.Router();

router.route("/").post(sendMessage);
router.route("/:chatId").get(allMessages);

module.exports = router;
