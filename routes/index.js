const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Personal Finance Tracker', 
    message: 'This web application was created to fulfill Web Technology module’s requirements and does not represent an actual company or service.'
  });
});

module.exports = router;