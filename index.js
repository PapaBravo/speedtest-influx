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