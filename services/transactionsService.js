// services/transactionsService.js
let transactions = [];
let nextId = 1;

exports.getAllTransactions = () => transactions;

exports.getTransactionById = (id) => 
  transactions.find(tx => tx.id === parseInt(id));

exports.addTransaction = (data) => {
    const newTransaction = {
      id: nextId++,
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      paymentMethod: data.paymentMethod,
      date: data.date,
      description: data.description
    };
    transactions.push(newTransaction);
  };  

exports.updateTransaction = (id, data) => {
  const index = transactions.findIndex(tx => tx.id === parseInt(id));
  if (index !== -1) {
    transactions[index] = {
      id: parseInt(id),
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      paymentMethod: data.paymentMethod,
      date: data.date,
      description: data.description
    };
  }
};

exports.deleteTransaction = (id) => {
  transactions = transactions.filter(tx => tx.id !== parseInt(id));
};
