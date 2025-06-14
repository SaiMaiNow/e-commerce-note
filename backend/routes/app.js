const express = require('express');
const router = express.Router();

router.use('/register', require('./router/register'));

router.use('/signin', require('./router/signin'));

router.use('/products', require('./router/products'));

router.use('/cart', require('./router/cart'));

router.use('/payment', require('./router/payment'));

module.exports = router;