const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

function connectDatabase() {
    try {
        const dbPath = path.join(__dirname, '..', 'database', 'database.db');
        db = new sqlite3.Database(dbPath);

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            birthday TEXT NOT NULL
        )`);

        return db;
    } catch (err) {
        throw new Error(err);
    }
}

function getDatabase() {
    return db;
}

module.exports = {
    connectDatabase,
    getDatabase
};