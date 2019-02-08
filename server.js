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
 *    person1: { publicId, name },
 *    person2: { publicId, name }
 * }
 */
router.post('/path', async (request, response) => {
    try {
        const { person1: p1, person2: p2 } = request.body;
        if (!p1 || !p1 || !p1.publicId || !p1.name || !p2.publicId || !p2.name) {
            response.sendStatus(400);
        }
        const path = await getConnectionPath(p1, p2);
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