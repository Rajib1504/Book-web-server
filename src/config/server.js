import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./../index.js";
dotenv.config();
const Port = process.env.PORT || 2000;
const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("database connected successfully");

    let server = app.listen(Port, () => {
      console.log(`server is running in ${Port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
