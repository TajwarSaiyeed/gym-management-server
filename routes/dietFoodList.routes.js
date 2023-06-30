const express = require("express");
const router = express.Router();
const dietFoodList = require("../controllers/dietFoodList.Controllers");

// get all exercise
// add exercise
router.route("/").get(dietFoodList.getAllFood).post(dietFoodList.addNewFood);

// delete exercise
router.route("/:id").delete(dietFoodList.deleteFood);

module.exports = router;
