const axios                = require('axios');
const { exportArrayToCSV } = require('./utils');
const BASE_PATH = 'https://torre.bio/api';

/**
 * Returns an array of Bios given an array of publicIds
 * @param {string[]} ids 
 */
async function fetchBios(ids) {
    const promises = [];
    ids.forEach(id => promises.push(axios.get(`${BASE_PATH}/bios/${id}`)));
    const values = await Promise.all(promises);
    return values.map(({ data }) => data);
}

/**
 * Normalizes a Torre Bio object and prepares it for exporting
 * @param {Object} bio 
 */
function prepareBioForExporting(bio) {
    const { 
        person: {
            publicId,
            name,
            email,
            phone,
            location,
            picture,
            weight,
            stats: {
                recommendations,
                recommendationsSent,
                verifiers,
                itemsVerified,
                signalers,
                signaled,
            },
            links
        },
        stats: {
            strengths, 
            publications,
            education,
            jobs,
            projects,
            achievements, 
            aspirations
        }
    } = bio;

    const getLink = (link) => {
        const found = links.find(({ name }) => name === link);
        return found ? found.address : '';
    }

    const newBio = {
        publicId,
        bioURL: `https://torre.bio/${publicId}`,
        name,
        email: email || '',
        phone: phone || '',
        location: location || '',
        picture: picture || '',
        twitter: getLink('twitter'),
        instagram: getLink('instagram'),
        medium: getLink('medium'),
        github: getLink('github'),
        weight,
        recommendations,
        recommendationsSent,
        verifiers,
        itemsVerified,
        signalers,
        signaled,
        strengths,
        publications,
        education,
        jobs,
        projects,
        achievements,
        aspirations
    };

    return newBio;
}

/**
 * Logic flow for fetching, normalizing and exporting an array of Bios
 * @param {string[]} ids 
 */
async function fetchBiosAndExportToCSV(ids) {
    const bios = await fetchBios(ids);
    const normalizedBios = bios.map(bio => prepareBioForExporting(bio));
    const csvFile = await exportArrayToCSV(normalizedBios);
    return csvFile;
}

module.exports = {
    fetchBios,
    fetchBiosAndExportToCSV
};

