const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const path = require('path');
const fsSync = require('fs/promises');
const fs = require('fs');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const storage = multer.diskStorage({
    filename: function (req, file, cd) {
        cd(null, file.originalname.replace(/[^a-zA-Z0-9.\-\s]/g, '_').replace(/\s+/g, '_'));
    },
    destination: async function (req, file, cb) {
        const user = req.session.user.username || req.session.user.email;
        const key = uuidv4();

        if (!user) {
            return cb(new Error('User not authenticated'));
        }

        const dir = path.join(__dirname, '..', 'uploads', user, key);
        try {
            await fsSync.access(dir);
        } catch (err) {
            await fsSync.mkdir(dir, { recursive: true });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/media/${user}/${key}/${file.originalname}`;
        file.fileUrl = fileUrl;
        cb(null, dir);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only file type [.txt, .jpeg, .png, .zip]'));
    }
};

const upload = multer({ storage, fileFilter });

const deleteFile = async (url) => {
    try {
        const parts = url.split('/media/')[1];
        if (!parts) {
            throw new Error('Name file not found');
        }

        const filePath = path.join(__dirname, '..', 'uploads', parts);
        const dirPath = path.join(__dirname, '..', 'uploads', parts.split('/')[0], parts.split('/')[1]);

        try {
            fsSync.access(dirPath);
            await fsSync.unlink(dirPath);
        } catch (err) {
            return true;
        }

        try {
            fsSync.access(filePath);
            await fsSync.unlink(filePath);
        } catch (err) {
            return true;
        }

    } catch (err) {
        console.error('Error deleting file:', err);
        return false;
    }
}

module.exports = {
    upload,
    deleteFile
};