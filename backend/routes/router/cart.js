const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

router.get('/get', async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(404).json({ ok: false, message: "User not authenticated" });
        }

        const cart = user.cart;
        const db = sqlite3.getDatabase();
        const mycart = await new Promise((resolve, reject) => {
            db.all('SELECT name, price, description, subject, image, token, sales, owner FROM products', [], async (err, rows) => {
                if (err) reject(err);
                if (!rows || rows.length <= 0) resolve([]);
                const data = rows.filter(p => cart.some(c => c.token == p.token));
                resolve(data)
            });
        });

        res.status(200).json({ ok: true, cart: mycart });
    } catch (err) {
        console.error('Add to cart / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { productToken } = req.body;
        if (!productToken) {
            return res.status(400).json({ ok: false, message: 'ProductToken are required' });
        }

        const user = req.session.user;
        if (!user) {
            return res.status(401).json({ ok: false, message: 'User not authenticated' });
        }

        const db = await sqlite3.getDatabase();

        const product = await new Promise((resolve, reject) => {
            db.get(`SELECT id FROM products WHERE token = ?`, [productToken], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!product || product.length <= 0) {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        await new Promise((resolve, reject) => {
            db.get(`SELECT cart FROM users WHERE username = ?`, [user.username], (err, result) => {
                if (err) return reject(err);
                if (!result) return reject(new Error('User not found'));

                let cart = result.cart ? JSON.parse(result.cart) : [];
                const cartIndex = cart.findIndex(item => item.token === productToken);
                if (cartIndex > 0) {
                    return reject(new Error('Product have in cart'));
                }

                cart.push({ token: productToken });

                user.cart = cart;

                db.run(`UPDATE users SET cart = ? WHERE username = ?`, [JSON.stringify(cart), user.username], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });

        res.status(200).json({ ok: true, message: 'Product added to cart successfully' });
    } catch (err) {
        console.error('Add to cart / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ok:false, message: 'token is not send to server'})
        }

        const user = req.session.user;
        if (!user || !user.username) {
            return res.status(401).json({ ok: false, message: 'User not authenticated' });
        }

        user.cart = user.cart.filter(c => c.token !== token);
        
        const db = await sqlite3.getDatabase();
        await new Promise((resolve, reject) => {
            db.run(`UPDATE users SET cart = ? WHERE username = ?`, [JSON.stringify(user.cart), user.username], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        res.status(200).json({ ok: true, message: 'Cart updated successfully' });
    } catch (err) {
        console.error('Update cart / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

module.exports = router;