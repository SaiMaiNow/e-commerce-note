const express = require('express');
const router = express.Router();

const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');
const _ = require('lodash');

const { getDatabase } = require('../../functions/sqlite3');

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

module.exports = router;