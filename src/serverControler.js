const path = require('path');
const { execSync } = require('child_process');

const serverScript = path.resolve(__dirname, '../server.js');

function killScript() {
    try {
        let pid = execSync(`pgrep node`);
        console.log(pid)
        pid = parseInt(pid.toString().split('\n')[1]);
        execSync(`kill -9 ${pid}`)
        console.log(`Successfully killed ${serverScript}`);
    } catch (error) {
        console.error(`Error killing script: ${error.message}`);
    }
}

function startScript() {
    try {
        execSync(`node ${serverScript}`);
        console.log(`Successfully Started ${serverScript}`);
    } catch (error) {
        console.error(`Error starting script: ${error.message}`);
    }
}

function restartServer() {
    killScript();
    setTimeout(() => {
        startScript();
    }, 3000);
}

module.exports = restartServer;