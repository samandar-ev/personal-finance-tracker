const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

//exchange rate map for converting between currencies
const exchangeRates = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.78,
  UZS: 12873,
  JPY: 145
};

//utility function to convert amounts between currencies
function convertAmount(amount, fromCurrency, toCurrency) {
  if (!exchangeRates[fromCurrency]) fromCurrency = 'USD'; //fallback if unknown
  if (!exchangeRates[toCurrency]) toCurrency = 'USD'; //fallback if unknown
  const amountInUSD = amount / exchangeRates[fromCurrency]; //convert to USD first
  return amountInUSD * exchangeRates[toCurrency]; //then convert to target currency
}

//GET /transactions - show all transactions for current user
router.get('/', async (req, res) => {
  try {
    const allTransactions = await transactionsService.getAll(req.user._id); //only user's transactions
    const displayCurrency = req.query.display || 'USD'; //default to USD if nothing selected

    const transactionsView = allTransactions.map(tx => {
      const plainTx = tx._doc || tx; //ensure we’re working with plain object
      const converted = convertAmount(plainTx.amount, plainTx.currency || 'USD', displayCurrency);
      return {
        ...plainTx,
        amountConverted: converted.toFixed(2) //formatted value for display
      };
    });

    res.render('transactionsList', {
      transactions: transactionsView,
      displayCurrency,
      currencies: ['USD', 'EUR', 'GBP', 'UZS', 'JPY']
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Server Error');
  }
});

//GET /transactions/new - render form to create new transaction
router.get('/new', (req, res) => {
  res.render('transactionsForm', { transaction: null, errors: null });
});

//POST /transactions/new - handle submission of new transaction form
router.post('/new', async (req, res) => {
  try {
    req.body.user = req.user._id; //attach current user ID to the transaction
    await transactionsService.addTransaction(req.body);
    res.redirect('/transactions');
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.render('transactionsForm', { transaction: req.body, errors: [{ msg: err.message }] });
  }
});

//GET /transactions/edit/:id - load form with transaction data for editing
router.get('/edit/:id', async (req, res) => {
  try {
    const transaction = await transactionsService.getById(req.params.id, req.user._id); //only fetch if owned by user
    if (!transaction) {
      return res.redirect('/transactions');
    }
    res.render('transactionsForm', { transaction, errors: null });
  } catch (err) {
    console.error('Error fetching transaction for edit:', err);
    res.redirect('/transactions');
  }
});

//POST /transactions/edit/:id - update transaction with form values
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

//POST /transactions/delete/:id - delete selected transaction
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