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
 * @param {*} env 
 * @param {string} message 
 */
async function sendToInflux(env, message) {
    return new Promise((resolve, reject) => {
        const buf = new Buffer(message.toString('binary'), 'binary');

        const options = {
            hostname: env.host,
            port: env.port,
            path: `/write?db=${env.db}`,
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
    return `speedtest${tags ? ',' : ''}${tags} ${values}`;
}

async function runSpeedtest(env) {
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
        sendToInflux(env, message);
    } catch (err) {
        console.error(err.message);
    }
}

function getEnvs() {
    // cutting out node path and file path
    const rawArgs = process.argv.slice(2);

    const args = {};
    rawArgs
        .filter(a => a.startsWith('--'))
        .map(a => a.slice(2))
        .map(a => a.split('='))
        .filter(a => a.length === 2)
        .forEach(a => args[a[0]] = a[1]);


    const defaults = {
        host: 'localhost',
        port: '8086',
        db: 'iot'
    }

    const env = Object.assign(defaults, args);
    env.port = Number(env.port)

    return Object.assign(defaults, args);
}

const env = getEnvs();
runSpeedtest(env);