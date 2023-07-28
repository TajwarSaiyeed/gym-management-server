const mongoose = require("mongoose");

const gymSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact_no: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Gym = mongoose.model("Gym", gymSchema);

module.exports = Gym;
