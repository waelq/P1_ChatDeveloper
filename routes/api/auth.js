const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");

// Must put 3 things

// @route    GET api/auth
// @desc     Test route
// @access   Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("auth server Error");
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  "/",
  [
    // check func in array for login
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is require").exists(),
  ],
  async (req, res) => {
    // data send access by body
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 bad request
      return res.status(400).json({ errors: errors.array() });
    }

    // to send data
    const { email, password } = req.body;
    // Make quiry

    try {
      // ******* If user exists *******
      let user = await User.findOne({ email: email });
      if (!user) {
        // return same type of error in error.array
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials Email" }] });
      }

      //  **********  Match Password **********
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials Password" }] });
      }
      // ********** Return jsonwebtoken >>> Using JWT for API authentication**********
      const payload = {
        user: {
          // id from mongoDB
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        // time to production optional
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
