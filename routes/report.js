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
    const displayCurrency = req.query.display || 'USD';

    const transactions = await transactionsService.getAll();

    const convertedTx = transactions.map(tx => {
      const plainTx = tx._doc || tx;
      const converted = convertAmount(plainTx.amount, plainTx.currency || 'USD', displayCurrency);
      return {
        ...plainTx,
        amount: converted
      };
    });

    const incomeTransactions = convertedTx.filter(tx => tx.type === 'income');
    const incomeTotal = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    let incomeBreakdown = {};
    incomeTransactions.forEach(tx => {
      if (!incomeBreakdown[tx.category]) {
        incomeBreakdown[tx.category] = 0;
      }
      incomeBreakdown[tx.category] += tx.amount;
    });
    const incomeData = Object.keys(incomeBreakdown).map(category => ({
      category,
      amount: incomeBreakdown[category],
      percentage: incomeTotal
        ? ((incomeBreakdown[category] / incomeTotal) * 100).toFixed(2)
        : 0
    }));

    const expenseTransactions = convertedTx.filter(tx => tx.type === 'expense');
    const expenseTotal = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    let expenseBreakdown = {};
    expenseTransactions.forEach(tx => {
      if (!expenseBreakdown[tx.category]) {
        expenseBreakdown[tx.category] = 0;
      }
      expenseBreakdown[tx.category] += tx.amount;
    });
    const expenseData = Object.keys(expenseBreakdown).map(category => ({
      category,
      amount: expenseBreakdown[category],
      percentage: expenseTotal
        ? ((expenseBreakdown[category] / expenseTotal) * 100).toFixed(2)
        : 0
    }));

    res.render('report', {
      title: 'Financial Report',
      displayCurrency,
      incomeTotal,
      expenseTotal,
      incomeData: JSON.stringify(incomeData),
      expenseData: JSON.stringify(expenseData),
      currencies: Object.keys(exchangeRates)
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
