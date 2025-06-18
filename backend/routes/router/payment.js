const express = require('express');
const router = express.Router();

const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');
const _ = require('lodash');

const { getDatabase } = require('../../functions/sqlite3');
const { upload } = require('../../functions/storage');

router.get('/get-payment', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ ok: false, message: 'Token is required' });
        }

        const db = await getDatabase();
        const product = await db.get(`SELECT price FROM products WHERE token = ?`, [token]);
        if (!product) {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        const amount = parseFloat(product.price);
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

router.post('/check-payment', [upload.fields([
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
        const product = await db.get(`SELECT id, price FROM products WHERE token = ?`, [token]);
        if (!product) {
            return res.status(404).json({ ok: false, message: 'Product not found' });
        }

        const owner = await db.get(`SELECT owner FROM users WHERE email = ?`, [email]);
        const formate = JSON.parse(owner);
        await formate.push(product.id);

        await db.run(`UPDATE users SET owner = ? WHERE email = ?`, [JSON.stringify(formate), email]);

        res.status(200).json({ ok: true, message: 'successfully' });
    } catch (err) {
        console.error('Check payment / :', err);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
});

module.exports = router;