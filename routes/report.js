const express = require('express');
const router = express.Router();
const transactionsService = require('../services/transactionsService');

router.get('/', (req, res) => {
  const transactions = transactionsService.getAllTransactions();

  //Aggregate Income Data
  const incomeTransactions = transactions.filter(tx => tx.type === 'income');
  const incomeTotal = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  let incomeBreakdown = {};
  incomeTransactions.forEach(tx => {
    const category = tx.category;
    if (!incomeBreakdown[category]) {
      incomeBreakdown[category] = 0;
    }
    incomeBreakdown[category] += tx.amount;
  });
  const incomeData = Object.keys(incomeBreakdown).map(category => ({
    category,
    amount: incomeBreakdown[category],
    percentage: incomeTotal ? ((incomeBreakdown[category] / incomeTotal) * 100).toFixed(2) : 0
  }));

  //Aggregate Expense Data
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  const expenseTotal = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  let expenseBreakdown = {};
  expenseTransactions.forEach(tx => {
    const category = tx.category;
    if (!expenseBreakdown[category]) {
      expenseBreakdown[category] = 0;
    }
    expenseBreakdown[category] += tx.amount;
  });
  const expenseData = Object.keys(expenseBreakdown).map(category => ({
    category,
    amount: expenseBreakdown[category],
    percentage: expenseTotal ? ((expenseBreakdown[category] / expenseTotal) * 100).toFixed(2) : 0
  }));

  res.render('report', { 
    title: 'Financial Report', 
    incomeTotal, 
    expenseTotal, 
    incomeData: JSON.stringify(incomeData), 
    expenseData: JSON.stringify(expenseData)
  });
});

module.exports = router;
