const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { 
    title: 'FinAssist', 
    message: 'This is my CW app from Web Technologies module.'
  });
});

module.exports = router;