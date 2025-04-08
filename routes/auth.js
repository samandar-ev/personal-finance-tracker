//load required modules
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const router = express.Router();

//import user service for DB interactions
const userService = require('../services/userService');

//render signup form
router.get('/signup', (req, res) => {
  res.render('signup', { message: null, errors: [] });
});

//handle signup logic with validations
router.post('/signup', [
  check('email')
    .isEmail().withMessage('Please enter a valid email address'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character')
], async (req, res) => {
  const errors = validationResult(req); //validate input
  if (!errors.isEmpty()) {
    return res.render('signup', { message: null, errors: errors.array() }); //show validation errors
  }

  const { email, password } = req.body;
  const existingUser = await userService.findByEmail(email); //check for duplicate email

  if (existingUser) {
    return res.render('signup', {
      message: 'An account with that email already exists',
      errors: []
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10); //hash password
    await userService.createUser(email, hash); //save user to DB
    res.redirect('/login'); //redirect to login after successful signup
  } catch (err) {
    console.error('Error creating user:', err); //log any error
    return res.render('signup', { message: 'Error creating user', errors: [] });
  }
});

//render login form
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

//handle login using passport
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/', //go to home if login succeeds
    failureRedirect: '/login' //go back to login if it fails
  })
);

//handle logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login'); //send user to login after logging out
  });
});

//export the router
module.exports = router;