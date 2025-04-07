const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

const exchangeRates = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.78,
  UZS: 12873,
  JPY: 145
};

function convertAmount(amount, fromCurrency, toCurrency) {
  if (!exchangeRates[fromCurrency]) fromCurrency = 'USD';
  if (!exchangeRates[toCurrency]) toCurrency = 'USD';
  const amountInUSD = amount / exchangeRates[fromCurrency];
  return amountInUSD * exchangeRates[toCurrency];
}

router.get('/', async (req, res) => {
  try {
    const allTransactions = await transactionsService.getAll(req.user._id);
    const displayCurrency = req.query.display || 'USD';

    const transactionsView = allTransactions.map(tx => {
      const plainTx = tx._doc || tx;
      const converted = convertAmount(plainTx.amount, plainTx.currency || 'USD', displayCurrency);
      return {
        ...plainTx,
        amountConverted: converted.toFixed(2)
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

router.get('/new', (req, res) => {
  res.render('transactionsForm', { transaction: null, errors: null });
});

router.post('/new', async (req, res) => {
  try {
    req.body.user = req.user._id;
    await transactionsService.addTransaction(req.body);
    res.redirect('/transactions');
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.render('transactionsForm', { transaction: req.body, errors: [{ msg: err.message }] });
  }
});

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
