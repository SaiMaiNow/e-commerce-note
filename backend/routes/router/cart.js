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
                const data = rows
                    .filter(p => cart.some(c => c.token == p.token))
                    .map(p => {
                        const cartItem = cart.find(c => c.token == p.token);
                        return { ...p, quantity: cartItem.quantity };
                    });
                    
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
        const { productToken, quantity } = req.body;
        if (!productToken || !quantity || quantity <= 0) {
            return res.status(400).json({ ok: false, message: 'Product or Quantity ID are required' });
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

                const qty = Number(quantity) || 1;
                const cartIndex = cart.findIndex(item => item.token === productToken);
                if (cartIndex > -1) {
                    cart[cartIndex].quantity += qty;
                } else {
                    cart.push({ token: productToken, quantity: qty });
                }

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

router.put('/update', async (req, res) => {
    try {
        // ถึง Frontend : CART ต้องเป็น Data Format นี้เท่านั้น [{token: "xxxxxxxxx", quantity: x}]
        const { cart } = req.body;
        if (!cart || !Array.isArray(cart)) {
            return res.status(400).json({ ok: false, message: 'Username and cart are required' });
        }
        const user = req.session.user;
        if (!user || !user.username) {
            return res.status(401).json({ ok: false, message: 'User not authenticated' });
        }

        const db = await sqlite3.getDatabase();

        await new Promise((resolve, reject) => {
            db.run(`UPDATE users SET cart = ? WHERE username = ?`, [JSON.stringify(cart), user.username], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        user.cart = cart;

        res.status(200).json({ ok: true, message: 'Cart updated successfully' });
    } catch (err) {
        console.error('Update cart / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

module.exports = router;