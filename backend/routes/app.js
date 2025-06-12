const express = require('express');
const router = express.Router();

router.use('/register', require('./router/register'));

