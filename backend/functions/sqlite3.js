const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

function connectDatabase() {
    try {
        const dbPath = path.join(__dirname, '..', 'database', 'database.db');
        db = new sqlite3.Database(dbPath);

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            birthday TEXT NOT NULL,
            cart TEXT NOT NULL DEFAULT '[]',
            owner TEXT NOT NULL DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price DOUBLE NOT NULL,
            description TEXT NOT NULL,
            subject TEXT NOT NULL DEFAULT 'ทั่วไป',
            image TEXT NOT NULL,
            file TEXT NOT NULL,
            token TEXT NOT NULL,
            sales INTEGER NOT NULL DEFAULT 0,
            owner INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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