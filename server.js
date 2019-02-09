const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const validator  = require('email-validator');
const mail       = require('./functions/mail');

const getConnectionPath           = require('./functions/connection-path');
const { fetchBiosAndExportToCSV } = require('./functions/bios');

const port   = process.env.PORT || 3000;
const app    = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 * Required structure in request body:
 * {
 *    publicId1,
 *    publicId2
 * }
 */
router.post('/connections', async (request, response) => {
    try {
        const { publicId1, publicId2 } = request.body;
        if (!publicId1 || !publicId2) {
            response.sendStatus(400);
        }
        const path = await getConnectionPath(publicId1, publicId2);
        response.json(path);
    } catch (error) {
        const status = error.status || 500;
        response.status(status).json(error);
    }
});

/**
 * Required structure in request body:
 * {
 *    ids: [string],
 *    email: string
 * }
 */
router.post('/export', async (request, response) => {
    try {
        const { ids, email } = request.body;

        if (!ids || !ids.length || !email || !validator.validate(email)) {
            return response.sendStatus(400);
        }
        
        const csv = await fetchBiosAndExportToCSV(ids);

        const mailOptions = {
            from: 'pruebatorre.co@gmail.com',
            to: email,
            subject: 'Your Torre export',
            html: "<p>Here's your Torre export :)</p>",
            attachments: [ { path: csv } ]
        };

        mail.sendMail(mailOptions, (error, data) => {
            if (error) throw error;
            return response.status(200).send(data);
        });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        response.status(status).json(error);
    }
});

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('Listening on port', port);

module.exports = app;