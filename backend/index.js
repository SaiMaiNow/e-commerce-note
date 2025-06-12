const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const session = require('express-session');

const sqlite3 = require('./functions/sqlite3');

const app = express();
const PORT = 4000;

let db = null;

app.use(cors());
app.use(bodyParser.json());

app.use(session({
    secret: 'kU!xG>{o#5id$a}^Ywby`);o#jk|^/DT',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 3
    }
}));

(async () => {
    try {
        db = await sqlite3.connectDatabase();
        console.log('Database connectioning...');
    } catch (error) {
        console.error('database:', error);
    }
})();

app.use('/api', require('./routes/app'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
