const axios        = require('axios');

const BASE_PATH = 'https://torre.bio/api';

async function fetchBios(ids) {
    const promises = [];
    ids.forEach(id => promises.push(axios.get(`${BASE_PATH}/bios/${id}`)));
    const values = await Promise.all(promises);
    return values.map(({ data }) => data);
}

module.exports = {
    fetchBios,
    biosToCSV
};

