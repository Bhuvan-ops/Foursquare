    const express = require("express");
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    const User = require("../models/User.js");
    const { ACCESS_TOKEN_SECRET } = process.env;
    const STATUS_CODES = require("../constants.js");

    const router = express.Router();

    router.post("/register", async (req, res) => {
    const { username, email, phonenumber, password, role } = req.body;
    try {
        const user = new User({ username, email, phonenumber, password, role });
        await user.save();
        res.status(STATUS_CODES.CREATED).json({ message: "User created successfully" });
    } catch (err) {
        res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "A user with these credentials already exists", error: err.message });
    }
    });

    router.post("/login", async (req, res) => {
        const { username, email, phonenumber, password } = req.body;
      
        try {
          let query = {};
          if (email) query.email = email;
          if (phonenumber) query.phonenumber = phonenumber;
          if (username) query.username = username;
      
          const user = await User.findOne(query);
      
          if (!user) return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "User not found" });
      
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Invalid credentials" });
      
          const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
          );
      
          if (user.role === "admin") {
            res.json({ message: "Login successful as Admin", token });
          } else {
            res.json({ message: "Login successful", token });
          }
        } catch (err) {
          res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error logging in", error: err.message });
        }
      });
      

    module.exports = router;