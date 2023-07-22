const express = require("express");
const router = express.Router();
const { verifyAdminOrTrainer } = require("../middleware/verifyAdminOrTrainer");
const exerciseController = require("../controllers/exercise.controllers");

router
  .route("/")
  .get(exerciseController.getExerciseDataByEmail)
  .put(verifyAdminOrTrainer, exerciseController.addExercise);

// router
//   .route("/:id")
//   .delete(verifyAdminOrTrainer, exerciseController.deleteDietById);

module.exports = router;
