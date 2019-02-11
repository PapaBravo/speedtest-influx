const http = require('http');
const speedTest = require('speedtest-net');

async function getCurrentSpeed() {
    return new Promise((resolve, reject) => {
        const test = speedTest({
            maxTime: 5000
        });
        test.on('data', resolve);
        test.on('error', reject);
    });
}

/**
 * 
 * @param {string} database 
 * @param {string} message 
 */
async function sendToInflux(database, message) {
    return new Promise((resolve, reject) => {
        const buf = new Buffer(message.toString('binary'), 'binary');

        const options = {
            hostname: 'localhost',
            port: 8086,
            path: `/write?db=${database}`,
            method: 'POST'
        };

        const req = http.request(options, res => {
            res.on('end', resolve);
        });
        req.on('error', reject);
        req.write(buf);
        req.end();
    });
}

const message = 'cpu_load_short,host=server01,region=us-west value=0.64 1434055562000000000';

sendToInflux('iot', message);