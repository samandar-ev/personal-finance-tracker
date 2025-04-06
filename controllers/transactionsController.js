let transactions = []; 


module.exports = {
  getAll() {
    return transactions;
  },

  getById(id) {
    return transactions.find(tx => tx.id === id);
  },

  addTransaction(data) {
    const newTx = {
      id: Date.now().toString(),
      type: data.type,
      category: data.category,
      paymentMethod: data.paymentMethod,
      amount: parseFloat(data.amount) || 0,
      date: data.date || '',
      description: data.description || ''
    };
    transactions.push(newTx);
  },

  updateTransaction(id, data) {
    const index = transactions.findIndex(tx => tx.id === id);
    if (index < 0) throw new Error("Transaction not found");
    transactions[index].type = data.type;
    transactions[index].category = data.category;
    transactions[index].paymentMethod = data.paymentMethod;
    transactions[index].amount = parseFloat(data.amount) || 0;
    transactions[index].date = data.date || '';
    transactions[index].description = data.description || '';
  },

  deleteTransaction(id) {
    transactions = transactions.filter(tx => tx.id !== id);
  }
};
