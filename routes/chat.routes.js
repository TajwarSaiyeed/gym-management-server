const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chat.Controllers");

const router = express.Router();

router.route("/").get(fetchChats).post(accessChat);
router.route("/group").post(createGroupChat);
router.route("/rename").patch(renameGroup);
router.route("/groupadd").patch(addToGroup);
router.route("/groupremove").put(removeFromGroup);

module.exports = router;
