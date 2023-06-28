const express = require("express");
const router = express.Router();
const exerciseListController = require("../controllers/exerciseList.controllers");

// get all exercise
// add exercise
router
  .route("/")
  .get(exerciseListController.getAllExercise)
  .post(exerciseListController.addNewExercise);

// delete exercise
router.route("/:id").delete(exerciseListController.deleteExercise);

module.exports = router;
