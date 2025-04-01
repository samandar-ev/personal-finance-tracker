const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

// List all transactions
router.get('/', transactionsController.listTransactions);

// Form to add a new transaction
router.get('/new', transactionsController.newTransactionForm);
router.post('/new', transactionsController.createTransaction);

// Form to edit an existing transaction
router.get('/edit/:id', transactionsController.editTransactionForm);
router.post('/edit/:id', transactionsController.updateTransaction);

// Delete a transaction
router.post('/delete/:id', transactionsController.deleteTransaction);

module.exports = router;
