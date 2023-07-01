const asyncHandler = require("express-async-handler");
const Diet = require("../models/diet.Model");

module.exports.addDiet = asyncHandler(async (req, res) => {
  try {
    const dietData = {
      ...req.body,
      assignedBy: req.decoded._id,
    };
    const query = { date: dietData.date, email: dietData.email };
    const result = await Diet.updateOne(
      query,
      {
        $set: dietData,
      },
      {
        upsert: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      data: error,
    });
  }
});

module.exports.getDietDataByEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.query;
    const query = { email: email };
    const result = await Diet.find(query).populate("assignedBy", "name");

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      data: error,
    });
  }
});

module.exports.deleteDietById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: id };
    const result = await Diet.deleteOne(query);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      data: error,
    });
  }
});
