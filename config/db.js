const mongoose = require("mongoose");

const connectDB = async () => {
  // mongoose.set("strictQuery", false);
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

module.exports = connectDB;
