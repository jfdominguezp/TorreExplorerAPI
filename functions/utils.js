const tmp          = require('tmp');
const ObjectsToCsv = require('objects-to-csv');

async function exportArrayToCSV(data) {
    const tempFile = tmp.fileSync({ mode: 0644, prefix: 'torre-', postfix: '.csv' });
    const csv = new ObjectsToCsv(data);
    await csv.toDisk(tempFile.name);
    return tempFile.name;
}

module.exports = {
    exportArrayToCSV
};