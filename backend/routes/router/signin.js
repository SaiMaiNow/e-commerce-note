const express = require('express');

const router = express.Router();
const sqlite3 = require('../../functions/sqlite3');
const obfuscator = require('../../functions/obfuscator');

router.get('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const db = await sqlite3.getDatabase();
        const encrypted = obfuscator.encrypted(password);
        const userExists = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, encrypted], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!userExists) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.session.user = {
            username: userExists.username,
            email: userExists.email
        };

        res.status(200).json({ message: 'Signin successful' });
    } catch (err) {
        console.error('Signin / :', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (err) {
        console.error('Logout / :', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/check', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        return res.status(200).json({
            message: 'Authenticated',
            user: {
                username: req.session.user.username,
                email: req.session.user.email
            }
        });
    } catch (err) {
        console.error('Signin / check:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;