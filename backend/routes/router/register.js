const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');
const obfuscator = require('../../functions/obfuscator');

router.post('/', async (req, res) => {
    try {
        const { username, email, password, birthday } = req.body;

        if (!username || !email || !password || !birthday) {
            return res.status(400).json({ok:false, message: 'not found data' });
        }

        const db = await sqlite3.getDatabase();

        const userExists = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        if (userExists) {
            return res.status(409).json({ok:false, message: 'Username or email already exists' });
        }

        const encrypted = obfuscator.encrypted(password);
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (username, email, password, birthday) VALUES (?, ?, ?, ?)`, [username, email, encrypted, birthday],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });

        req.session.user = {
            username: username,
            email: email
        };

        res.status(201).json({ ok: true, message: 'User registered successfully' });
    } catch (err) {
        console.error('Register / :', err);
        res.status(500).json({ ok:false, message: 'Internal server error' });
    }
});

module.exports = router;