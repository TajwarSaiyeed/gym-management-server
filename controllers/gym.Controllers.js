const asyncHandler = require("express-async-handler");
const Gym = require("../models/gym.Model");

const createGym = asyncHandler(async (req, res) => {
  const { name, owner_name, email, contact_no, address } = req.body;

  const isExist = await Gym.findOne({ name, email });

  if (isExist) {
    return res.status(400).json({
      status: "fail",
      message: "Gym already exist",
    });
  }

  try {
    const gym = await Gym.create({
      name,
      owner_name,
      email,
      contact_no,
      address,
    });

    res.status(201).json({
      status: "success",
      data: gym,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

const getGyms = asyncHandler(async (req, res) => {
  try {
    const gyms = await Gym.find({});

    res.status(200).json({
      status: "success",
      data: gyms,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error?.message,
    });
  }
});

const deleteGym = asyncHandler(async (req, res) => {
  const gymId = req.query.id;
  try {
    const gym = await Gym.findByIdAndDelete(gymId);

    if (!gym) {
      res.status(404);
      throw new Error("Gym not found");
    }

    res.status(200).json({
      status: "success",
      data: gym,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error?.message,
    });
  }
});

module.exports = { createGym, getGyms, deleteGym };
