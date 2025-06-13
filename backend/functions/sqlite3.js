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

        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price DOUBLE NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            file TEXT NOT NULL,
            token TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        )`)

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