const axios = require('axios');

const BASE_PATH = 'https://torre.bio/api';

/**
 * Logic flow for finding the path that connects two people in the Torre network
 * @param {string} publicId1 - Public Id of the person of reference
 * @param {string} publicId2 - Public Id of the person to find
 */
async function getConnectionPath(publicId1, publicId2) {
    const p1Connections = await getData(`${BASE_PATH}/people/${publicId1}/connections`);

    //Find target person in the connections array of the reference person
    const p2 = p1Connections.find(({ person: { publicId } }) => {
        return publicId === publicId2;
    });
    if (!p2 || !p2.person) throw { status: 404, error: 'Connection not found' };

    //Return a 1-step path if connection is first degree
    if (p2.degrees ===  1) {
        return { degrees: p2.degrees, path: [p2.person] };
    }

    //Call a recursive function for building the connection path
    const path = await buildPath(p1Connections, p2.person.publicId);
    return { degrees: p2.degrees, path };
}

/**
 * Recursive method that obtains the shortest connection path between two people.
 * @param {*} connections - Connections to process.
 * @param {*} targetId - The publicId of the target person in the network.
 * @param {*} path - Cummulative variable. Holds the path while it's built step by step.
 */
async function buildPath(connections, targetId, path = []) {
    //Stop case - When the target is not in the network. Useful for debugging the algorithm.
    const targetInConnections = connections.find(({ person: { publicId } }) => publicId === targetId);
    if (!targetInConnections) return [];

    const firstLevel = getFirstLevelConnections(connections);

    //Base case - When the target is a first level contact in the connections array.
    const foundTarget = firstLevel.find(({ person: { publicId } }) => publicId === targetId);
    if (foundTarget) return [...path, foundTarget.person];

    //Recursion - When the target is a 2nd+ degree connection
    const qualifiedConnections = await qualifyConnections(firstLevel, targetId);
    const { connections: nextLevelConnections, person } = qualifiedConnections[0];
    return await buildPath(nextLevelConnections, targetId, [...path, person]);
}

/**
 * Returns the first level connections sorted by reputation weight in a given connections array.
 * @param {Object[]} connections 
 */
function getFirstLevelConnections(connections) {
    const firstLevelConnections = connections.filter(({ degrees }) => {
        return degrees === 1
    }).sort((a, b) => {
        return b.person.weight - a.person.weight;
    });
    return firstLevelConnections;
}

/**
 * Creates an array of connections that lead to the target person. It's sorted by degree in ascending order.
 * @param {Object[]} connections 
 * @param {string} targetId 
 */
async function qualifyConnections(connections, targetId) {
    const qualifiedConnections = [];
    for (let connection of connections) {
        const url = `${BASE_PATH}/people/${connection.person.publicId}/connections`;
        console.log("Fetching connections from", url);
        const data = await getData(url);
        const foundTarget = data.find(({ person: { publicId } }) => publicId === targetId);
        if (foundTarget) {
            qualifiedConnections.push({
                person: connection.person,
                degrees: foundTarget.degrees,
                connections: data
            });
        }
    }
    const sortedQualifiedConnections = qualifiedConnections.sort((a, b) => a.degrees - b.degrees );
    return sortedQualifiedConnections;
}

/**
 * Wraps axios' GET method and returns response data.
 * @param {string} path 
 */
async function getData(path) {
    const response = await axios.get(path);
    return response.data;
}

module.exports = getConnectionPath;