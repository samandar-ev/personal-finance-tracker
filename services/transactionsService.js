const Transaction = require('../models/Transaction');

module.exports = {
  async getAll(userId) {
    //return transactions that belong only to the logged-in user
    return await Transaction.find({ user: userId }).exec();
  },

  async getById(id, userId) {
    //get a single transaction by its ID and make sure it belongs to the user
    return await Transaction.findOne({ _id: id, user: userId }).exec();
  },

  async addTransaction(data) {
    //make sure type starts with uppercase, rest lowercase
    const formattedType = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();

    //create new transaction using mongoose model
    const newTx = new Transaction({
      user: data.user, //link transaction to specific user
      type: formattedType,
      category: data.category,
      paymentMethod: data.paymentMethod,
      amount: parseFloat(data.amount) || 0, //fallback to 0 if input is bad
      date: data.date || '',
      description: data.description || '',
      currency: data.currency || 'USD' //default currency
    });

    await newTx.save(); //save to MongoDB
  },

  async updateTransaction(id, data, userId) {
    //make sure only transactions owned by the user can be updated
    const tx = await Transaction.findOne({ _id: id, user: userId }).exec();
    if (!tx) {
      throw new Error("Transaction not found");
    }

    //normalize the transaction type like before
    const formattedType = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();

    //update all editable fields
    tx.type = formattedType;
    tx.category = data.category;
    tx.paymentMethod = data.paymentMethod;
    tx.amount = parseFloat(data.amount) || 0;
    tx.date = data.date || '';
    tx.description = data.description || '';
    tx.currency = data.currency || 'USD';

    await tx.save(); //apply updates to the DB
  },

  async deleteTransaction(id, userId) {
    //remove only the transaction that belongs to this user
    await Transaction.findOneAndDelete({ _id: id, user: userId }).exec();
  }
};