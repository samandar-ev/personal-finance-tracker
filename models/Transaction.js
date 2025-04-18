// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    enum: ['Income', 'Expense'], 
    required: true 
  },
  category: String,
  paymentMethod: String,
  amount: { 
    type: Number, 
    required: true 
  },
  date: String,
  description: String,
  currency: { 
    type: String, 
    default: 'USD' 
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
