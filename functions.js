const axios = require('axios');

const BASE_PATH = 'https://torre.bio/api';

module.exports = {
    getConnectionPath
}

/**
 * Required structure:
 * {
 *    person1: { publicId, name },
 *    person2: { publicId, name }
 * }
 */
async function getConnectionPath(person1, person2) {
    const p1Connections = await getData(`${BASE_PATH}/people/${person1.publicId}/connections`);

    //Find person2 in person1 connections
    const p2 = p1Connections.find(({ person: { publicId } }) => {
        return publicId === person2.publicId;
    });
    if (!p2 || !p2.person) throw { status: 404, error: 'Connection not found' };

    //Return a 1-step path if connection is first degree
    if (p2.degrees ===  1) {
        return { degrees: p2.degrees, path: [p2.person] };
    }

    const p2Connections = await getData(`${BASE_PATH}/people/${p2.person.publicId}/connections`);
    const path = await buildPath(p2.degrees, p1Connections, p2Connections);
    return { degrees: p2.degrees, path };
}

async function getData(path) {
    const response = await axios.get(path);
    return response.data;
}