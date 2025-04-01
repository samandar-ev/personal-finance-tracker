const transactionsService = require('../services/transactionsService');

exports.listTransactions = (req, res) => {
  const transactions = transactionsService.getAllTransactions();
  // Calculate budget tracking values (using a fixed monthly budget for demo)
  const monthlyBudget = 1000;
  const currentMonthExpenses = transactions
    .filter(tx => tx.type === 'expense')  // Add date filtering if needed
    .reduce((sum, tx) => sum + tx.amount, 0);
  const budgetExceeded = currentMonthExpenses > monthlyBudget;
  res.render('transactions', { title: 'Transactions', transactions, budgetExceeded, monthlyBudget, currentMonthExpenses });
};

exports.newTransactionForm = (req, res) => {
  res.render('transactionForm', { title: 'New Transaction' });
};

exports.createTransaction = (req, res) => {
  transactionsService.addTransaction(req.body);
  res.redirect('/transactions');
};

exports.editTransactionForm = (req, res) => {
  const transaction = transactionsService.getTransactionById(req.params.id);
  res.render('transactionForm', { title: 'Edit Transaction', transaction });
};

exports.updateTransaction = (req, res) => {
  transactionsService.updateTransaction(req.params.id, req.body);
  res.redirect('/transactions');
};

exports.deleteTransaction = (req, res) => {
  transactionsService.deleteTransaction(req.params.id);
  res.redirect('/transactions');
};
