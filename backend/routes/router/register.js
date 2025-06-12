const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');
const obfuscator = require('../../functions/obfuscator');

router.post('/', async (req, res) => {
    try {
        const { username, email, password, birthday } = req.body;

        if (!username || !email || !password || !birthday) {
            return res.status(400).json({ message: 'not found data' });
        }

        const db = await sqlite3.getDatabase();

        await db.run(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email], (err, row) => {
            if (err) {
                throw new Error(err);
            }

            if (row.length > 0) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
        });

        const encrypted = obfuscator.encrypted(password);
        await db.run(`INSERT INTO users (username, email, password, birthday) VALUES (?, ?, ?, ?)`, [username, email, encrypted, birthday], function (err) {
            if (err) {
                throw new Error(err);
            }
        });

        req.session.user = {
            username: username,
            email: email
        };

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register / :', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;