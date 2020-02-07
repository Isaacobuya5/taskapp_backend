// user model
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  tokens: [
    {
      token: { type: String, required: true }
    }
  ]
});

// Hashing a password before saving it to db
UserSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// generating tokens for authenticated users
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  // create a unique token using user id and the secret
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
  // adding the token to array of user's tokens
  user.tokens = user.tokens.concat({ token });
  // save the current use with token
  await user.save();
  // return the token
  return token;
};

// Searching for a user by email and password
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  // if email does not exist means invalid user
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  // checking password agains encrypted password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error({ error: "Invalid login credentials" });
  }
  // return user if valid
  return user;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
