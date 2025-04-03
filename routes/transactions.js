const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const transactionsController = require('../controllers/transactionsController');

//List all transactions
router.get('/', transactionsController.listTransactions);

//Show form to add a new transaction
router.get('/new', transactionsController.newTransactionForm);

// Validate and create a new transaction
router.post(
  '/new',
  [
    check('amount')
      .isNumeric()
      .withMessage('Please enter a valid number for the amount.')
  ],
  transactionsController.createTransaction
);

//Show form to edit an existing transaction
router.get('/edit/:id', transactionsController.editTransactionForm);

//Validate and update a transaction
router.post(
  '/edit/:id',
  [
    check('amount')
      .isNumeric()
      .withMessage('Please enter a valid number for the amount.')
  ],
  transactionsController.updateTransaction
);

//Delete a transaction
router.post('/delete/:id', transactionsController.deleteTransaction);

module.exports = router;
