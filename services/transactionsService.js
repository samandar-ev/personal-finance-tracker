const Transaction = require('../models/Transaction');

module.exports = {
  async getAll(userId) {
    // Return transactions only for the given user
    return await Transaction.find({ user: userId }).exec();
  },

  async getById(id, userId) {
    return await Transaction.findOne({ _id: id, user: userId }).exec();
  },

  async addTransaction(data) {
    const formattedType = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
    const newTx = new Transaction({
      user: data.user,
      type: formattedType,
      category: data.category,
      paymentMethod: data.paymentMethod,
      amount: parseFloat(data.amount) || 0,
      date: data.date || '',
      description: data.description || '',
      currency: data.currency || 'USD'
    });
    await newTx.save();
  },

  async updateTransaction(id, data, userId) {
    const tx = await Transaction.findOne({ _id: id, user: userId }).exec();
    if (!tx) {
      throw new Error("Transaction not found");
    }
    const formattedType = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
    tx.type = formattedType;
    tx.category = data.category;
    tx.paymentMethod = data.paymentMethod;
    tx.amount = parseFloat(data.amount) || 0;
    tx.date = data.date || '';
    tx.description = data.description || '';
    tx.currency = data.currency || 'USD';
    await tx.save();
  },

  async deleteTransaction(id, userId) {
    await Transaction.findOneAndDelete({ _id: id, user: userId }).exec();
  }
};
