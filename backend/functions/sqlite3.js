const sqlite3 = require('sqlite3').verbose();

const db = null;

function connectDatabase() {
    try {
        db = new sqlite3.Database('../database/database.db');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
            birthday TEXT NOT NULL,
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