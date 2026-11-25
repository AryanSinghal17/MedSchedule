const express = require("express");
const router = express.Router();

const userAuth = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "please fill all details",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const checkUser = await userAuth.findOne({ email: normalizedEmail });
    if (checkUser) {
      return res.status(409).json({
        message: "user is all ready exist",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await userAuth.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword,
    });

    return res.status(201).json({
      message: "Account created.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: `there is an err :${err}`,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "please fill all details",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const checkUser = await userAuth.findOne({ email: normalizedEmail });
    if (!checkUser) {
      return res.status(401).json({
        message: "User did not exist",
      });
    }
    const hashCompare = await bcrypt.compare(password, checkUser.passwordHash);
    if (!hashCompare) {
      return res.status(401).json({
        messgae: "Incorrect email or password",
      });
    }

    req.session.userId = checkUser._id.toString();
    // token
    return res.status(200).json({
      message: "login In Done",
      user: {
        userId: checkUser._id,
        userName: checkUser.name,
        userEmail: checkUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: `there is an error ${err}`,
    });
  }
});

// check tokken
router.get("/me", async (req, res) => {
  try {
    const user = await userAuth.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({ message: "Not logged in." });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
});

// post/logout

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(401).json({ message: "Not logged in." });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Could not log out." });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out." });
  });
});
module.exports = router;
