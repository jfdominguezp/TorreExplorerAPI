const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');

const getConnectionPath = require('./functions/connection-path');
const fetchBios = require('./functions/bios');

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

router.post('/export', async (request, response) => {
    try {
        const { ids } = request.body;
        if (!ids || !ids.length) return response.sendStatus(400);
        const data = await fetchBios(ids);
        return response.status(200).send(data);
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