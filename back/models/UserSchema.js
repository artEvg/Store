const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },

  name: {
    type: String,
    require: true,
  },

  password: {
    type: String,
    require: true,
  },

  role: {
    type: String,
    default: "user",
  },
});

module.exports = mongoose.model("User", UserSchema);
