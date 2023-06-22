const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification.Model");

module.exports.addNotification = asyncHandler(async (req, res) => {
  const { notificationType, email, notificationText, isRead, pathName, to } =
    req.body;

  const notification = {
    notificationType,
    email,
    notificationText,
    isRead,
    pathName,
    to,
    from: req.decoded._id,
  };

  const createdNotification = await Notification.create(notification);

  res.status(201).json({
    status: "success",
    data: createdNotification,
  });
});

// isRead: false to true || mark as read by id
module.exports.markAsRead = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    const notification = await Notification.findOne({
      _id: req.params.id,
    });

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    if (email !== decodedEmail) {
      res.status(401);
      throw new Error("Not authorized to mark as read");
    } else {
      notification.isRead = true;
      const updatedNotification = await notification.save();
      res.status(200).json({
        status: "success",
        data: updatedNotification,
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
});

// get all notifications
module.exports.getNotificationByEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    const notification = await Notification.find({
      email: email,
    })
      .populate("to")
      .populate("from", "name");

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    if (email !== decodedEmail) {
      res.status(401);
      throw new Error("Not authorized to get notification");
    } else {
      res.status(200).json({
        status: "success",
        data: notification,
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
});

// delete notification by user || id

module.exports.deleteNotification = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email;
    const notification = await Notification.findOne({
      _id: req.params.id,
    });
    const decodedEmail = req.decoded.email;

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    if (email !== decodedEmail) {
      res.status(401);
      throw new Error("Not authorized to delete");
    } else {
      await Notification.deleteOne({ _id: req.params.id });
      res.status(200).json({
        status: "success",
        message: "Notification deleted",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
});
