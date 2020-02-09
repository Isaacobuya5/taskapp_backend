const express = require("express");
const router = express.Router();
// bcrypt for encrypting password
const bcrypt = require("bcrypt");

// jwt for generating tokens
const jwt = require("jsonwebtoken");

// nodemailer for sending emails
const nodemailer = require("nodemailer");

// getting the user model
const User = require("../model/User");
// our middleware
const auth = require("../middleware/middleware");

//create a reusable transporter object using the default SMTP transporter
let transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b05a5214417d23", //generate your mailtrap username and change
    pass: "899104ff65c5fb" //generated your mail trap password and change
  }
});

// fron end base URL for resetting password
const baseURL = "http://localhost:3000/new_password";

// function to send token to user's email
function sendTokenToMail(userEmail, token) {
  let mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Reset your account password",
    html:
      `<h4><b>Reset Password</b></h4>` +
      `<p>To reset your password, click the following link ${baseURL}/${token} to create a new password</p>`
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

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
  console.log(req.body);
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
    res.status(400).send(error.stack);
    console.log(error);
  }
});

// Logging out a user
router.post("/users/logout", auth, async (req, res) => {
  console.log(req.user.tokens);
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

// send a password link to email
router.post("/users/forgot_password", async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  try {
    // find user with the given email from the database
    const user = User.findOne({ email });
    // throw error if user with the above email address
    if (!user) {
      throw new Error({ error: "Sorry, this email address does not exist" });
    }
    // generate a unique token using the given email address and the secret
    const token = jwt.sign({ email }, process.env.PASSWORD_SECRET, {
      expiresIn: "1h"
    });
    console.log(token);

    // save the new token in the user's database
    await user.update({
      resetPasswordToken: token
    });

    // sending the token to the user's email
    await sendTokenToMail(email, token);
    console.log("email sent");
    // send a succesful status
    res
      .status(200)
      .json({ message: `Email sent succesfully to ${email}`, token });
  } catch (error) {
    res.status(400).json({ error: "Could not send password reset link" });
  }
});

// create a new password
router.get("/users/new_password/:token", async (req, res) => {
  const { token } = req.params;
  try {
    // verify and decode the token
    const payload = await jwt.verify(token, process.env.PASSWORD_SECRET);
    console.log(payload);

    res.status(200).json({ message: "Succesfully accessed", payload });
    return payload;
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
});

// updating the password
router.put("/users/newpassword", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    // find the user with the the given email
    const user = await User.find({ email });
    console.log(user);
    if (!user) {
      throw new Error("Invalid user");
    }

    // encrypt tyhe provided password
    const encryptedPassword = await bcrypt.hash(password, 8);

    // update the user's password
    // await user.update({
    //   password: encryptedPassword,
    //   resetPasswordToken: null
    // });
    // console.log(user);
    await User.findOneAndUpdate(
      { email },
      { password: encryptedPassword, resetPasswordToken: null }
    );

    // succesful response
    res.status(200).json({ message: "Password update succesful" });
  } catch (error) {
    res.status(400).json({ error });
    console.log(error);
  }
});

module.exports = router;
