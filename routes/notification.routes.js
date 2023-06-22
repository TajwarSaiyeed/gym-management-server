const express = require("express");

const router = express.Router();

const notificationControllers = require("../controllers/notification.controllers");

// add notifcation
// get all notifications

router
  .route("/")
  .post(
    // add notifcation
    notificationControllers.addNotification
  )
  .get(
    // get notification by user || id
    notificationControllers.getNotificationByEmail
  );

// isRead: false to true || mark as read
router
  .route("/:id")
  .patch(
    // isRead: false to true || mark as read
    notificationControllers.markAsRead
  )
  .delete(
    // delete notification by user || id
    notificationControllers.deleteNotification
  );

module.exports = router;
