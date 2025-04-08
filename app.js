//app.js
require('dotenv').config(); //load environment variables from .env file

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo'); //store sessions in MongoDB
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const connectDB = require('./db'); //MongoDB connection helper
connectDB();

const userService = require('./services/userService'); //functions to manage users

const app = express();
app.set('trust proxy', 1); //trust proxy for secure cookies (important for deployment)

app.set('views', path.join(__dirname, 'views')); //set views directory
app.set('view engine', 'pug'); //set view engine to Pug

app.use(bodyParser.urlencoded({ extended: false })); //parse form data

app.use(express.static(path.join(__dirname, 'public'))); //serve static files

app.use(session({
  secret: process.env.SESSION_SECRET || 'your secret key here', //don't forget to set this in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI //store sessions in MongoDB
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', //use secure cookies only in production
    maxAge: 1000 * 60 * 60 * 24 //1 day
  }
}));

app.use(passport.initialize()); //initialize Passport
app.use(passport.session()); //use Passport for session management

app.use((req, res, next) => {
  res.locals.user = req.user; //make current user available in views
  next();
});

//setup login strategy using email instead of username
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
    return done(null, user); //successful login
  } catch (err) {
    return done(err);
  }
}));

//serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

//deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

//middleware to protect routes that require login
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//route handlers
const authRouter = require('./routes/auth');
app.use('/', authRouter);

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const transactionsRouter = require('./routes/transactions');
app.use('/transactions', isAuthenticated, transactionsRouter);

const reportRouter = require('./routes/report');
app.use('/report', isAuthenticated, reportRouter);

//start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
