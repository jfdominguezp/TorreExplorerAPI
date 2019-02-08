const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');

const { getConnectionPath } = require('./functions');

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
router.post('/path', async (request, response) => {
    try {
        const { publicId1, publicId2 } = request.body;
        if (!publicId1 || !publicId2) {
            response.sendStatus(400);
        }
        const path = await getConnectionPath(publicId1, publicId2);
        response.send(path);
    } catch (error) {
        const status = error.status || 500;
        response.status(status).send(error);
    }
});

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('Listening on port', port);

module.exports = app;