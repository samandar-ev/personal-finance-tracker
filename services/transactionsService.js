const Transaction = require('../models/Transaction');

module.exports = {
  async getAll() {
    return await Transaction.find({}).exec();
  },

  async getById(id) {
    return await Transaction.findById(id).exec();
  },

  async addTransaction(data) {
    const formattedType = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();

    const newTx = new Transaction({
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

  async updateTransaction(id, data) {
    const tx = await Transaction.findById(id).exec();
    if (!tx) {
      throw new Error("Transaction not found");
    }
    tx.type = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
    tx.category = data.category;
    tx.paymentMethod = data.paymentMethod;
    tx.amount = parseFloat(data.amount) || 0;
    tx.date = data.date || '';
    tx.description = data.description || '';
    tx.currency = data.currency || 'USD';
    await tx.save();
  },

  async deleteTransaction(id) {
    await Transaction.findByIdAndDelete(id).exec();
  }
};
