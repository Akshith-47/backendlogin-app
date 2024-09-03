const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

// Check for duplicate username or email
const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check for duplicate username
    const userByUsername = await User.findOne({
      username: req.body.username
    });

    if (userByUsername) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    // Check for duplicate email
    const userByEmail = await User.findOne({
      email: req.body.email
    });

    if (userByEmail) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next(); // Proceed to the next middleware if no duplicates found
  } catch (err) {
    res.status(500).send({ message: err.message || "Internal Server Error" });
  }
};

// Check if roles exist
const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
      }
    }
  }

  next(); // Proceed to the next middleware if all roles are valid
};

// Export the verification middleware functions
const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
