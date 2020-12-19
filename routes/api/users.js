const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
// conect data
const User = require("../../models/User");
// check for body
// validationResult take req to checked
const { check, validationResult } = require("express-validator/check");
// Must put 3 things

// @route    POST api/users
// @desc     Test route
// @access   Public
router.post(
  "/",
  [
    // check func in array
    check("name", "Name is requird").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or mor char").isLength({
      min: 6,
    }),
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
    const { name, email, password } = req.body;
    try {
      // ******* If user exists *******
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already Exists" }] });
      }
      // pass 3 options value (s:size , r:reding ,d:userIcone (defualt))
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // ******* Encrypt password ******

      // salt to hashing  10 recomanded in doc
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // anything return promes should have await
      await user.save();

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

    // res.send("User Registered..");
  }
);
module.exports = router;
