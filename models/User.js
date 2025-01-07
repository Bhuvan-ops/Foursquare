const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,6}$/, 'Please provide a valid email address']
  },

  phonenumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
  },

  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  
  role: {
    type: String,
    required: true,
    enum: ["basic", "admin"],
    default: "basic"
  }
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
