const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

const { upload, deleteFile } = require('../../functions/storage');

router.get('/get-all', async (req, res) => {
    try {
        const db = await sqlite3.getDatabase();
        db.all('SELECT * FROM products', [], (err, rows) => {
            if (err) {
                throw new Error(err);
            }

            if (!rows || rows.length === 0) {
                return res.status(200).json({
                    ok: true,
                    products: [],
                });
            }

            return res.status(200).json({
                ok: true,
                products: rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    price: row.price,
                    description: row.description,
                    subject: row.subject,
                    image: row.image,
                    file: row.file,
                    token: row.token
                }))
            });
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ok:false, error: 'Internal Server Error' });
    }
});

router.post('/create', [upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
])], async (req, res) => {
    try {
        const { name, price, description, subject } = req.body;
        const files = req.files;

        if (!files || !files.image || !files.file) {
            return res.status(400).json({ok:false, error: 'Image and file are required' });
        }

        if (!name || !price || !description || !subject) {
            return res.status(400).json({ok:false, error: 'All fields are required' });
        }

        const db = await sqlite3.getDatabase();
        const token = uuidv4();

        db.run(`INSERT INTO products (name, price, description, subject, image, file, token) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, price, description, subject, files.image[0].fileUrl, files.file[0].fileUrl, token],
            function (err) {
                if (err) {
                    throw new Error(err);
                }

                res.status(201).json({
                    ok: true,
                    message: 'Product created successfully', product: {
                        name, price, description, subject, image: files.image[0].fileUrl, file: files.file[0].fileUrl, token
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ok:false, error: 'Internal Server Error' });
    }
});

router.put('/update/:token', [upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
])], async (req, res) => {
    try {
        const { token } = req.params;
        const { name, price, description, subject } = req.body;
        const files = req.files;

        if (!name || !price || !description || !subject) {
            return res.status(400).json({ok:false, error: 'All fields are required' });
        }

        const db = await sqlite3.getDatabase();
        db.run(`UPDATE products SET name = ?, price = ?, description = ?, subject = ? WHERE token = ?`,
            [name, price, description, subject, token],
            function (err, rows) {
                if (rows.length === 0) {
                    return res.status(404).json({ok:false, error: 'Product not found' });
                }

                if (err) {
                    throw new Error(err);
                }

                if (files && files.image && files.image[0]) {
                    deleteFile(rows[0].image);
                    db.run(`UPDATE products SET image = ? WHERE token = ?`, [files.image[0].fileUrl, token]);
                }

                if (files && files.file && files.file[0]) {
                    deleteFile(rows[0].file);
                    db.run(`UPDATE products SET file = ? WHERE token = ?`, [files.file[0].fileUrl, token]);
                }

                res.status(200).json({
                    ok: true,
                    message: 'Product updated successfully', product: {
                        id, name, price, description, subject, image: files.image[0].fileUrl, file: files.file[0].fileUrl, token
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ok:false, error: 'Internal Server Error' });
    }
});

router.delete('/delete/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const db = await sqlite3.getDatabase();
        db.run(`DELETE FROM products WHERE token = ?`, [token], function (err) {
            if (err) {
                throw new Error(err);
            }

            if (this.changes === 0) {
                return res.status(404).json({ok:false, error: 'Product not found' });
            }

            res.status(200).json({ok:true, message: 'Product deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ok:false, error: 'Internal Server Error' });
    }
});

module.exports = router;