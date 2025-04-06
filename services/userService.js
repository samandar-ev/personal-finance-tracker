const User = require('../models/User');

module.exports = {
  async findByEmail(email) {
    return await User.findOne({ email }).exec();
  },

  async findById(id) {
    return await User.findById(id).exec();
  },

  async createUser(email, passwordHash) {
    const newUser = new User({
      email,
      passwordHash
    });
    await newUser.save();
  }
};
