const express = require('express');
const router = express.Router();

const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');

const { getDatabase } = require('../../functions/sqlite3');
const { upload } = require('../../functions/storage');

router.get('/get', async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(404).json({ ok: false, message: "User not authenticated" });
        }

        const db = await getDatabase();
        const cart = user.cart;

        const mycart = await new Promise((resolve, reject) => {
            db.all('SELECT price, token FROM products', [], (err, rows) => {
                if (err) reject(err);
                if (!rows || rows.length <= 0) reject(new Error("Product not found"));

                const data = rows
                    .filter(p => cart.some(c => c.token == p.token))
                    .map(p => {
                        const cartItem = cart.find(c => c.token == p.token);
                        return { ...p, quantity: cartItem.quantity };
                    });
                resolve(data);
            });
        });

        const sumprice = mycart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const amount = parseFloat(sumprice);
        const mobilenumber = "0616736843";
        const payload = generatePayload(mobilenumber, { amount });
        const option = {
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }

        await QRCode.toDataURL(payload, option, (err, url) => {
            if (err) {
                console.error('QRCode error:', err);
                return res.status(400).json({ ok: false, message: 'QRCode error' });
            }

            res.status(200).json({ ok: true, qrcode: url });
        });
    } catch (err) {
        console.error('Get payment / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

router.post('/order', [upload.fields([
    { name: 'slip', maxCount: 1 }
])], async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ ok: false, message: 'Token is required' });
        }

        const { slip } = req.files;
        if (!slip) {
            return res.status(400).json({ ok: false, message: 'Slip is required' });
        }

        const email = req.session.user.email;
        if (!email) {
            return res.status(400).json({ ok: false, message: 'Email is required' });
        }

        const db = await getDatabase();
        const product = await new Promise((resolve, reject) => {
            db.get(`SELECT id, price, sales FROM products WHERE token = ?`, [token], (err, row) => {
                if (err) reject(err);

                resolve(row)
            });
        });

        if (!product) {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        await db.get(`SELECT owner FROM users WHERE email = ?`, [email], async (err, rows) => {
            if (err) throw new Error(err);

            const formate = JSON.parse(owner);
            await formate.push(product.token);

            await db.run(`UPDATE users SET owner = ? WHERE email = ?`, [JSON.stringify(formate), email], (err) => {
                if (err) throw new Error(err);
            });

            await db.run('UPDATE products SET sales = ? WHERE token = ?', [product.sales + 1, token], (err) => {
                if (err) throw new Error(err);
            });
        });

        res.status(200).json({ ok: true, message: 'successfully' });
    } catch (err) {
        console.error('Check payment / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

module.exports = router;