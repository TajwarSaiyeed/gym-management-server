const express = require("express");
const router = express.Router();

const feesController = require("../controllers/fees.Controllers");
const { verifyAdmin } = require("../middleware/verifyAdmin");

// get all fees for admin
// create a new fee by admin or trainer

router
  .route("/")
  .get(feesController.getAllFees)
  .put(verifyAdmin, feesController.createFee);

// get all fees by student

router.route("/student").get(feesController.getAllFeesByStudent);

// paid the fee by student
router.route("/student/:id").patch(feesController.paidFee);

module.exports = router;
