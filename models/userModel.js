const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "trainer"],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  paid: {
    type: Boolean,
  },
  transactionId: {
    type: String,
  },
  fees: {
    type: Number,
  },
  salary: {
    type: Number,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
