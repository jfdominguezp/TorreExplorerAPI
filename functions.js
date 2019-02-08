const axios = require('axios');

const BASE_PATH = 'https://torre.bio/api';

module.exports = {
    getConnectionPath
}

async function getConnectionPath(publicId1, publicId2) {
    const response = await axios.get(`${BASE_PATH}/people/${publicId1}/connections`);
    const data = response.data;
    return data;
}