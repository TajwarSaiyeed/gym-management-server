const mongoose = require("mongoose");

const feesSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    month: {
      type: String,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      required: [true, "Please provide month", "Invalid month", 400],
    },
    year: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Fees = mongoose.model("Fees", feesSchema);

module.exports = Fees;
