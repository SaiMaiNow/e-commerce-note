const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const sqlite3 = require('../../functions/sqlite3');

router.get('/get-all', async (req, res) => {
    try {
        const db = await sqlite3.connectDatabase();
        db.run(`SELECT * FROM products`, [], (err, rows) => {
            if (err) {
                throw new Error(err);
            }

            if (!rows || rows.length === 0) {
                return res.status(404).json({ error: 'No products found' });
            }
            
            return res.status(200).json(rows);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const files = req.files;

        if (!files || !files.image || !files.file) {
            return res.status(400).json({ error: 'Image and file are required' });
        }

        if (!name || !price || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = await sqlite3.getDatabase();
        const token = uuidv4();

        db.run(`INSERT INTO products (name, price, description, image, file, token) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, description, files.image[0].path, files.file[0].path, token],
            function (err) {
                if (err) {
                    throw new Error(err);
                }
            }
        );

        res.status(201).json({ message: 'Product created successfully', product: {
            name, price, description, image: files.image[0].path, file: files.file[0].path, token
        }});
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/update/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { name, price, description } = req.body;
        const files = req.files;

        if (!files || !files.image || !files.file) {
            return res.status(400).json({ error: 'Image and file are required' });
        }

        if (!name || !price || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = await sqlite3.getDatabase();
        db.run(`UPDATE products SET name = ?, price = ?, description = ?, image = ?, file = ? WHERE token = ?`,
            [name, price, description, files.image[0].path, files.file[0].path, token],
            function (err) {
                if (err) {
                    throw new Error(err);
                }
            }
        );

        res.status(200).json({ message: 'Product updated successfully', product: {
            id, name, price, description, image: files.image[0].path, file: files.file[0].path, token
        }});
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
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
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});