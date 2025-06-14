const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

router.get('get-cart',  (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ ok: false, message: 'Username is required' });
        }

        const db = sqlite3.getDatabase();

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ ok:false, message: 'Internal server error' });
    }
});

module.exports = router;