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

function buildMessage(data) {
    let message = 'speedtest';
    message += Object.entries(data.tags).map(([k,v]) => `${k}=${v}`).join(',');
    message += ' ';
    message += Object.entries(data.values).map(([k,v]) => `${k}=${v}`).join(',');
    return message;
}

const data = {
    values: {
        download: 5.8,
        upload: 3.2,
        ping: 22
    },
    tags: {
        clientIp: '127.0.0.1',
        server: 'some.speedtest.com'
    }
}

const message = buildMessage(data);

sendToInflux('iot', message);