// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Set up view engine to use Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRouter = require('./routes/index');
const transactionsRouter = require('./routes/transactions');

app.use('/', indexRouter);
app.use('/transactions', transactionsRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});