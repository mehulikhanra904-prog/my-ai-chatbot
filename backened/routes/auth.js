const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/user");

const router = express.Router();

// In-memory fallback storage when MongoDB connection is offline
const localUsers = [];

async function findUserByEmail(email) {
  if (mongoose.connection.readyState === 1) {
    return User.findOne({ email });
  }
  return localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

async function createUser(userData) {
  if (mongoose.connection.readyState === 1) {
    return User.create(userData);
  }
  const newUser = {
    _id: `${Date.now()}-${Math.random()}`,
    ...userData,
    createdAt: new Date(),
  };
  localUsers.push(newUser);
  return newUser;
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: error.message || "Signup failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key_12345";

    const token = jwt.sign(
      {
        userId: user._id,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage || "en-US",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
});

module.exports = router;