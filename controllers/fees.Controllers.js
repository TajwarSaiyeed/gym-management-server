const asyncHandler = require("express-async-handler");
const Fees = require("../models/fees.Model");
const User = require("../models/user.Model");

// get all fees for admin
module.exports.getAllFees = asyncHandler(async (req, res) => {
  const gymId = req.query.gymId;

  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    try {
      const fees = await Fees.find().populate("studentId");
      res.status(200).json({
        status: "success",
        data: fees,
      });
    } catch (error) {
      return res.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  }

  let myGymUsersFees = [];

  try {
    const users = await Fees.find({}).populate("studentId");

    users.forEach((user) => {
      if (user.studentId.gymId == gymId) {
        myGymUsersFees.push(user);
      }
    });

    res.status(200).json({
      status: "success",
      data: myGymUsersFees,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

// create a new fee by admin or trainer
module.exports.createFee = asyncHandler(async (req, res) => {
  const { month, year, email } = req.query;
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
      email,
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
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

// get all fees by student
module.exports.getAllFeesByStudent = asyncHandler(async (req, res) => {
  const email = req.query.email;
  try {
    const fees = await Fees.find({
      email: email,
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

// get one

module.exports.getOneFee = asyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const fee = await Fees.findById(id);

    if (!fee) {
      return res.status(404).json({
        status: "fail",
        message: "Fee not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: fee,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

// paid the fee by student

module.exports.updateFeeStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const fee = await Fees.findById(id);

    if (!fee) {
      return res.status(404).json({
        status: "fail",
        message: "Fee not found",
      });
    }

    const filter = { _id: id };
    const update = { status: status };

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
