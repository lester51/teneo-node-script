const path = require('path');
const { execSync } = require('child_process');

const serverScript = path.resolve(__dirname, '../server.js');

function killScript() {
    try {
        let pid = execSync(`pgrep node`);
        pid = parseInt(pid.toString().split('\n')[1]);
        execSync(`kill ${pid}`)
    } catch (error) {
        killScript();
    }
}

function startScript() {
    try {
        execSync(`node ${serverScript}`);
    } catch (error) {
        startScript();
    }
}

function restartServer() {
    killScript();
    setTimeout(() => {
        startScript();
    }, 3000);
}

module.exports = restartServer;