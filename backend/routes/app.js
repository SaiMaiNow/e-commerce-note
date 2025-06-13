const express = require('express');
const router = express.Router();

router.use('/register', require('./router/register'));

router.use('/signin', require('./router/signin'));

router.use('/products', require('./router/products'));

module.exports = router;