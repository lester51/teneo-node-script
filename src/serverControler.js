const path = require('path');
const { execSync } = require('child_process');

const serverScript = path.resolve(__dirname, '../server.js');

function killScript(server) {
    try {
        execSync(`/bin/sh`);
        let pid = execSync(`pgrep node`);
        pid = parseInt(pid.toString().split('\n')[1]);
        execSync(`kill ${pid}`);
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

function restartServer(server) {
    killScript(server);
    setTimeout(() => {
        startScript();
    }, 3000);
}

module.exports = restartServer;