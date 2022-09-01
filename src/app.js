const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./router/user.router");

app.use(cors());
app.use(bodyParser.json());

app.use("/users", userRouter);

module.exports = app;
