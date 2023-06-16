const asyncHandler = require("express-async-handler");
const Fees = require("../models/fees.Model");
const { ObjectId } = require("mongodb");

// get all fees for admin
module.exports.getAllFees = asyncHandler(async (req, res) => {
  const fees = await Fees.find().populate("studentId");
  res.status(200).json({
    status: "success",
    data: fees,
  });
});

// create a new fee by admin or trainer
module.exports.createFee = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const { studentId, amount, note } = req.body;

  const isExist = await Fees.findOne({ studentId, month, year });

  if (isExist) {
    return res.status(400).json({
      status: "fail",
      message: "Fee already exist",
    });
  }

  try {
    const fee = await Fees.create({
      studentId,
      month,
      year,
      amount,
      note,
    });

    res.status(201).json({
      status: "success",
      data: fee,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

// get all fees by student
module.exports.getAllFeesByStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const fees = await Fees.find({
      studentId: id,
    }).populate("studentId");

    res.status(200).json({
      status: "success",
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed to get fees",
      message: error.message,
    });
  }
});

// paid the fee by student

module.exports.paidFee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { transactionId, paymentDate } = req.body;

  try {
    const fee = await Fees.findById(id);

    if (!fee) {
      return res.status(404).json({
        status: "fail",
        message: "Fee not found",
      });
    }

    if (fee.isPaid) {
      return res.status(400).json({
        status: "fail",
        message: "Fee already paid",
      });
    }

    const filter = { _id: id };
    const update = { isPaid: true, transactionId, paymentDate };

    const updatedFee = await Fees.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      data: updatedFee,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});
