const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const userService = require('../services/userService');

router.get('/signup', (req, res) => {
  res.render('signup', { message: null, errors: [] });
});

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', { message: null, errors: errors.array() });
  }

  const { email, password } = req.body;

  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    return res.render('signup', {
      message: 'An account with that email already exists',
      errors: []
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await userService.createUser(email, hash);

    res.redirect('/login');
  } catch (err) {
    console.error('Error creating user:', err);
    return res.render('signup', { message: 'Error creating user', errors: [] });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = router;
