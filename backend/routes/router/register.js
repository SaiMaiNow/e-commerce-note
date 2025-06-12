const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'not found data' });
        }

        


    } catch (err) {
        console.error('Register / :', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});