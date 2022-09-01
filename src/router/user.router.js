const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/users");

const userService = require("../service/user.service");

// import { parsecsv } from "../service/user.service";
const userRouter = express.Router();

userRouter.get("/parsecsv", async (req, res) => {
  try {
    const users = await userService.parsecsv();
    res.status(200).send({ users: users, message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.get("/", auth, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).send({ users, message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.get("/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const user = await userService.findUser(id);
    res.status(200).send({ user, message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.post("/add", async (req, res) => {
  const user = new User({
    ...req.body,
  });

  try {
    const response = await userService.addNewUser(user);
    res.status(201).send({ response, message: "SUCCESS" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user) {
      return res.status(400).send({ error: "UnMatched credentials" });
    }
    const token = await user.generateAuthToken();

    res.send({ user, token, message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

userRouter.delete("/:id", auth, async (req, res) => {
  try {
    //todo enum
    if (req.user.userType != "Super User") {
      res.status(404).send({ message: "Unauthorized operation" });
    }

    const user = await User.deleteOne({ _id: req.params.id });
    res.status(201).send({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.patch("/:id", auth, async (req, res) => {
  try {
    //todo enum
    if (req.user.userType != "Super User") {
      res.status(404).send({ message: "Unauthorized operation" });
    }

    const user = await User.updateOne({ _id: req.params.id });
    res.status(201).send({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
});

userRouter.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["userName", , "email", "isSuperUser"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Operation" });
  }

  try {
    const user = User.findOne({ _id: req.params.id });
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = userRouter;
