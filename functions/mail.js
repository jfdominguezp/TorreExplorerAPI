const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pruebatorre.co@gmail.com',
        pass: 'PruebaTorre12345*'
    }
});

module.exports = transporter;