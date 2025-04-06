// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

// GET all transactions -> Show transactionsList
router.get('/', async (req, res) => {
  try {
    // Pass the logged-in user's ID to get only their transactions
    const allTransactions = await transactionsService.getAll(req.user._id);
    const displayCurrency = req.query.display || 'USD';

    // Convert each transaction's amount to the display currency (assume tx.amountConverted is calculated)
    const transactionsView = allTransactions.map(tx => {
      const plainTx = tx._doc || tx;
      // You may already have conversion logic elsewhere; here we assume plainTx has an amount and currency.
      // If you have conversion logic (like convertAmount), use it here as needed.
      return {
        ...plainTx,
        // For example, if you store converted value, else display original amount
        amountConverted: plainTx.amount.toFixed(2)
      };
    });

    res.render('transactionsList', {
      transactions: transactionsView,
      displayCurrency,
      currencies: ['USD', 'EUR', 'GBP', 'UZS', 'JPY']  // or Object.keys(exchangeRates)
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Server Error');
  }
});

// GET new transaction form
router.get('/new', (req, res) => {
  res.render('transactionsForm', { transaction: null, errors: null });
});

// POST create new transaction
router.post('/new', async (req, res) => {
  try {
    // Append the current user's ID to req.body before saving
    req.body.user = req.user._id;
    await transactionsService.addTransaction(req.body);
    res.redirect('/transactions');
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.render('transactionsForm', { transaction: req.body, errors: [{ msg: err.message }] });
  }
});

// GET edit form for existing transaction
router.get('/edit/:id', async (req, res) => {
  try {
    const transaction = await transactionsService.getById(req.params.id, req.user._id);
    if (!transaction) {
      return res.redirect('/transactions');
    }
    res.render('transactionsForm', { transaction, errors: null });
  } catch (err) {
    console.error('Error fetching transaction for edit:', err);
    res.redirect('/transactions');
  }
});

// POST update existing transaction
router.post('/edit/:id', async (req, res) => {
  try {
    await transactionsService.updateTransaction(req.params.id, req.body, req.user._id);
    res.redirect('/transactions');
  } catch (err) {
    console.error('Error updating transaction:', err);
    req.body.id = req.params.id;
    res.render('transactionsForm', { transaction: req.body, errors: [{ msg: err.message }] });
  }
});

// POST delete transaction
router.post('/delete/:id', async (req, res) => {
  try {
    await transactionsService.deleteTransaction(req.params.id, req.user._id);
    res.redirect('/transactions');
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.redirect('/transactions');
  }
});

module.exports = router;
