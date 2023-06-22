const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    notificationType: {
      type: String,
      enum: ["message", "exercise", "diet", "payment", "attendance"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    notificationText: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
    },
    pathName: {
      type: String,
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
