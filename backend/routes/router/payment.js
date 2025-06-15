const express = require('express');
const router = express.Router();

router.get('/get-payment', (req, res) => {
    // try {
    //     const username = req.session.user.username;
    //     if (!username) {
    //         return res.status(404).json({ ok: false, message: 'user is not login' });
    //     }

    //     res.status(200).json({ ok: true,  });
    // } catch (err) {
    //     console.error('Get payment / :', err);
    //     res.status(500).json({ ok: false, message: 'Internal server error' });
    // }
});

module.exports = router;