const User = require('../models/User');

module.exports = {
  async findByEmail(email) {
    //check if a user with this email already exists
    return await User.findOne({ email }).exec();
  },

  async findById(id) {
    //get user by their MongoDB _id (used during login sessions)
    return await User.findById(id).exec();
  },

  async createUser(email, passwordHash) {
    //create a new user with hashed password
    const newUser = new User({
      email,
      passwordHash
    });
    await newUser.save(); //save the new user to DB
  }
};
