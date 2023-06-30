const mongoose = require("mongoose");

const dietFoodListSchema = mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const dietFoodList = mongoose.model("dietFoodList", dietFoodListSchema);

module.exports = dietFoodList;
