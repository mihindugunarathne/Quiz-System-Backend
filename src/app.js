const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const quizRoutes = require("./routes/quizRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/quiz-system")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/quiz", quizRoutes);

module.exports = app;