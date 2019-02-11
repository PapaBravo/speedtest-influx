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
    const tags = Object.entries(data.tags).map(([k, v]) => `${k}=${v}`).join(',');
    const values = Object.entries(data.values).map(([k, v]) => `${k}=${v}`).join(',');
    return `speedtest${tags ? ',': ''}${tags} ${values}`;
}

async function runSpeedtest() {
    try {
        console.log('Running speedtest.');
        const res = await getCurrentSpeed();
        console.log(`Measured ${res.speeds.download} down and ${res.speeds.upload} up`);
        const data = {
            values: {
                download: res.speeds.download,
                upload: res.speeds.upload,
                ping: res.server.ping
            },
            tags: {
                clientIp: res.client.ip,
                server: res.server.host
            }
        };
        const message = buildMessage(data);
        sendToInflux('iot', message);
    } catch (err) {
        console.error(err.message);
    }
}

// TODO externalize database name and measurement name to process.args
runSpeedtest();