const express = require("express");
const router = express.Router();
// bcrypt for encrypting password
const bcrypt = require("bcrypt");
// getting the user model
const User = require("../model/User");
// our middleware
const auth = require("../middleware/middleware");

// creating a new user
router.post("/users", async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;
  const newUser = new User({
    username,
    email,
    password
  });
  try {
    const result = await newUser.save();
    res.status(201).json({
      result,
      message: "User created succesfully"
    });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

// fetch all users
router.get("/users", async (req, res) => {
  try {
    const results = await User.find();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

router.post("/users/login", async (req, res) => {
  // Login a registered user
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    // if not registered user
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    // for valid user
    // token to be generated here
    const token = await user.generateAuthToken();
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

// Logging out a user
router.post("/users/logout", auth, async (req, res) => {
  console.log(req.user.tokens)
  try {

    // filter user's tokens array and return true if any of the tokens is not equal to that which was used to login user
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token != req.token;
    });

    await req.user.save();
    res.status(200).send({ message: "User succesfully logged out" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
