const express = require('express');
const router = express.Router();

router.use('/register', require('./router/register'));

router.use('/signin', require('./router/signin'));

module.exports = router;