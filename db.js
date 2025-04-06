// db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas', err);
  }
}

module.exports = connectDB;
