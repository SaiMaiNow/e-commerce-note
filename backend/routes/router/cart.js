const express = require('express');
const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

router.get('/get', async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(404).json({ok:false, message:"User not authenticated"});
        }

        const db = sqlite3.getDatabase();
        const cartToken = await new Promise((resolve, reject) => {
            db.all('SELECT cart FROM user WHERE email = ?', [user.email], (err, row) => {
                if (err) reject(err);
                resolve(row)
            });
        });

        if (!cartToken) {
            return res.status(200).json({ok:true, cart: []});
        }

        const cartArray = JSON.parse(cartToken);

        if (!cartArray || cartArray.length <= 0) {
            return res.status(200).json({ok:true, cart: []});
        }

        const mycart = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM products', [], async (err, rows) => {
                if (err) reject(err);

                if (!rows || rows.length <= 0) resolve([]);
                
                const data = await rows.filter(p => cartArray.includes(p.token));
                resolve(data)
            });
        });

        res.status(200).json({ok:true, cart: mycart});
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

        const username = req.session.user.username;
        if (!username) {
            return res.status(401).json({ ok: false, message: 'User not authenticated' });
        }

        const db = await sqlite3.getDatabase();

        const product = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM products WHERE token = ?`, [productToken], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!product) {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        await new Promise((resolve, reject) => {
            db.get(`SELECT cart FROM users WHERE username = ?`, [username], (err, result) => {
                if (err) return reject(err);
                let cart = result.cart ? JSON.parse(result.cart) : [];

                const cartIndex = cart.findIndex(item => item.token === productToken);
                if (cartIndex > -1) {
                    cart[cartIndex].quantity += quantity;
                } else {
                    cart.push({ token: productToken, quantity });
                }

                db.run(`UPDATE users SET cart = ? WHERE username = ?`, [JSON.stringify(cart), username], (err) => {
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
        const { cart } = req.body;
        if (!username || !cart || !Array.isArray(cart)) {
            return res.status(400).json({ ok: false, message: 'Username and cart are required' });
        }
        const username = req.session.user.username;
        if (!username) {
            return res.status(401).json({ ok: false, message: 'User not authenticated' });
        }

        const db = await sqlite3.getDatabase();

        await new Promise((resolve, reject) => {
            db.run(`UPDATE users SET cart = ? WHERE username = ?`, [JSON.stringify(cart), username], (err) => {
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