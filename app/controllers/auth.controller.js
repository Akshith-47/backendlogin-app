const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Signup Function
exports.signup = async (req, res) => {
  try {
    // Create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    // Save user to database
    const savedUser = await user.save();

    // Assign roles to the user
    if (req.body.roles) {
      // Find roles from the database
      const roles = await Role.find({
        name: { $in: req.body.roles },
      });

      savedUser.roles = roles.map((role) => role._id);
    } else {
      // Assign default role "user"
      const role = await Role.findOne({ name: "user" });
      savedUser.roles = [role._id];
    }

    // Save user with assigned roles
    await savedUser.save();
    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message || "Internal Server Error" });
  }
};

// Signin Function
exports.signin = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({ email: req.body.email }).populate("roles", "-__v");
    console.log(req.body.email);

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      }
    );

    // Map user roles to authorities
    const authorities = user.roles.map((role) => "ROLE_" + role.name.toUpperCase());

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Internal Server Error" });
  }
};
