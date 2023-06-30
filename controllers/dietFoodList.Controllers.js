const asyncHandler = require("express-async-handler");
const dietFoodList = require("../models/dietFoodList.Model");

module.exports.addNewFood = asyncHandler(async (req, res) => {
  const { foodName } = req.body;

  try {
    if (!foodName) {
      res.status(400);
      throw new Error("Please enter food name");
    } else {
      // if exercise name already exists

      const isExist = await dietFoodList.findOne({ foodName });

      if (isExist) {
        return res.status(400).json({
          success: false,
          message: "Food already exists",
        });
      }

      const food = await dietFoodList.create({
        foodName,
      });
      if (food) {
        res.status(201).json({
          success: true,
          data: food,
        });
      }
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// get all exercise in an array
module.exports.getAllFood = asyncHandler(async (req, res) => {
  try {
    const foods = await dietFoodList.find({});
    if (foods) {
      res.status(200).json({
        success: true,
        data: foods,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// delete exercise
module.exports.deleteFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const food = await dietFoodList.deleteOne({ _id: id });
    if (food) {
      res.status(200).json({
        success: true,
        data: food,
      });
    } else {
      res.status(400);
      throw new Error("Food not found");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});
