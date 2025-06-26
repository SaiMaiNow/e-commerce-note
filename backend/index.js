const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fs = require('fs/promises');
const path = require('path');

const session = require('express-session');

const sqlite3 = require('./functions/sqlite3');

const app = express();
const PORT = 4000;

let db = null;

app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'kU!xG>{o#5id$a}^Ywby`);o#jk|^/DT',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 3,
        httpOnly: true
    }
}));

(async () => {
    try {
        db = await sqlite3.connectDatabase();
        console.log('Database connectioning...');

        const uploadsPath = path.join(__dirname, 'uploads');
        try {
            await fs.access(uploadsPath);
        } catch {
            await fs.mkdir(uploadsPath, { recursive: true });
        }
    } catch (error) {
        console.error('database:', error);
    }
})();

app.use('/api', require('./routes/app'));

app.use('/media', (req, res, next) => {
    const filePath = req.url;

     if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
    } else {
        res.setHeader('Content-Disposition', 'attachment');
    }
    
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
}, express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 