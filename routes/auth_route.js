    const express = require("express");
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    const User = require("../models/user_model.js");
    const { ACCESS_TOKEN_SECRET } = process.env;
    const STATUS_CODES = require("../constants.js");
    const authenticate = require("../middlewares/auth_middleware.js");

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

          if (email) {
              query.email = email;
          } else if (phonenumber) {
              query.phonenumber = phonenumber;
          } else if (username) {
              query.username = username;
          }          
      
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
      
      router.post("/logout", authenticate, async (req, res) => {
        const token = req.headers.authorization?.split(" ")[1];
    
        if (!token) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No token provided" });
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
            if (err) {
                return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Your session has expired. Please log in again." });
            }
    
            res.status(STATUS_CODES.SUCCESS).json({ message: "Logged out successfully" });
        });
    });    

      module.exports = router;