const { validationResult } = require('express-validator');
const transactionsService = require('../services/transactionsService');

exports.listTransactions = (req, res) => {
  const transactions = transactionsService.getAllTransactions();
  res.render('transactions', { title: 'Transactions', transactions });
};

exports.newTransactionForm = (req, res) => {
  res.render('transactionForm', { title: 'New Transaction', errors: null, transaction: {} });
};

exports.createTransaction = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('transactionForm', {
      title: 'New Transaction',
      errors: errors.array(),
      transaction: req.body
    });
  }
  transactionsService.addTransaction(req.body);
  res.redirect('/transactions');
};

exports.editTransactionForm = (req, res) => {
  const transaction = transactionsService.getTransactionById(req.params.id);
  res.render('transactionForm', { title: 'Edit Transaction', errors: null, transaction });
};

exports.updateTransaction = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('transactionForm', {
      title: 'Edit Transaction',
      errors: errors.array(),
      transaction: { ...req.body, id: req.params.id }
    });
  }
  transactionsService.updateTransaction(req.params.id, req.body);
  res.redirect('/transactions');
};

exports.deleteTransaction = (req, res) => {
  transactionsService.deleteTransaction(req.params.id);
  res.redirect('/transactions');
};