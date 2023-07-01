const mongoose = require("mongoose");

const dietSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: [
      {
        _id: {
          type: String,
          required: true,
        },
        foodName: {
          type: String,
          required: true,
        },
        BF: {
          type: Boolean,
          required: true,
        },
        MM: {
          type: Boolean,
          required: true,
        },
        L: {
          type: Boolean,
          required: true,
        },
        ES: {
          type: Boolean,
          required: true,
        },
        D: {
          type: Boolean,
          required: true,
        },
      },
    ],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Diet = mongoose.model("Diet", dietSchema);

module.exports = Diet;
