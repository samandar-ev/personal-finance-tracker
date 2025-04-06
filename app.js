// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const connectDB = require('./db');
connectDB();

const userService = require('./services/userService');

const app = express();

// Set view engine to Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware with MongoStore
app.use(session({
  secret: process.env.SESSION_SECRET || 'your secret key here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await userService.findByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Utility middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Mount routes
const authRouter = require('./routes/auth');
app.use('/', authRouter);

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const transactionsRouter = require('./routes/transactions');
app.use('/transactions', isAuthenticated, transactionsRouter);

const reportRouter = require('./routes/report');
app.use('/report', isAuthenticated, reportRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
