const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

router.get('/', async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(400).json({ ok: false, error: 'User is required' });
        }

        const db = await sqlite3.getDatabase();

        const products = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM products WHERE owner = ?', [user.username], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const myorder = await new Promise((resolve, reject) => {
            db.get('SELECT owner FROM users WHERE email = ?', [user.email], (err, row) => {
                if (err) reject(err);
                if (!row || !row.owner) return resolve([]);

                const owner = JSON.parse(row.owner);

                if (!owner) return resolve([]);

                db.all('SELECT * FROM products', [], async (err, rows) => {
                    if (err) reject(err)

                    if (!rows || rows.length <= 0) return resolve([]);

                    const data = rows.filter(p => owner.some(c => c.token === p.token));

                    resolve(data)
                });
            });
        });

        res.status(200).json({
            ok: true,
            username: user.username,
            email: user.email,
            myproduct: products,
            myorder: myorder,
        });
    } catch (err) {
        console.error('Profile / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

module.exports = router;