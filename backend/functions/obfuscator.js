function encrypted(data) {
    return Buffer.from(data).toString('base64');
}

function decrypted(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

module.exports = {
    encrypted,
    decrypted
};