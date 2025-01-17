const colors = require('colors/safe');
const axios = require('axios');
const WebSocket = require('ws');
const setupServers = require('../server');

let pingIntervals = {}, config, accessToken, sockets = {};
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

async function getAccessToken(creds) {
    console.log(colors.info.bold("[ SYSTEM ]") + colors.info(` Please wait while logging you in . . .\n`));
    let { data } = await axios.post('https://auth.teneo.pro/api/login', {
        'email': creds.email,
        'password': creds.pass
    }, {
        headers: {
            'authority': 'auth.teneo.pro',
            'origin': 'https://dashboard.teneo.pro',
            'referer': 'https://dashboard.teneo.pro/',
            'x-api-key': 'OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA'
        }
    });
    return data;
}

function connectWebSocket(aT, opt) {
    config = opt || false;
    if (typeof aT === 'object') {
        accessToken = aT.access_token;
        uid = aT.user.id;
    } else {
        accessToken = aT;
        uid = null;
    }
    let version = "v0.2";
    let url = "wss://secure.ws.teneo.pro";
    let wsUrl = `${url}/websocket?accessToken=${encodeURIComponent(accessToken)}&version=${encodeURIComponent(version)}`;
    const socket = new WebSocket(wsUrl);
    sockets[accessToken] = socket;
    socket.on('open', () => {
        console.log(colors.info.bold('[ INFO ]') + colors.info(' WebSocket connected.'));
        console.log(colors.info.bold("[ CONFIG ]") + "\n" + colors.info('User  ID: ' + uid + "\n" + "Ping Logging: " + config.silentPing));
        console.log();
        startPinging(socket, accessToken);
    });
    socket.on('message', (data) => {
        console.log(colors.debug.bold("[ PONG ]") + colors.debug(' Received message: ' + data.toString()));
    });
    socket.on('close', () => {
        console.log(colors.warn.bold("[ WARNING ]") + colors.warn(' WebSocket connection closed.'));
        delete sockets[accessToken];
        console.log(colors.info.bold("[ INFO ]") + colors.info(' Trying to reconnect...'));
        connectWebSocket(aT, config);
    });
    socket.on('error', (error) => {
        console.log(colors.error('WebSocket error: ' + error));
        delete sockets[accessToken];
    });
}

function startPinging(socket, accessToken) {
    stopPinging(accessToken);
    pingIntervals[accessToken] = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "PING" }));
            if (!config.silentPing) console.log(colors.verbose.bold("[ PONG ]") + colors.verbose(' Ping Message: ' + JSON.stringify({ type: "PING", date: new Date().toISOString() })));
        }
    }, 15000);
}

function stopPinging(accessToken) {
    if (pingIntervals[accessToken]) {
        clearInterval(pingIntervals[accessToken]);
        delete pingIntervals[accessToken];
    }
}

function displayHeader() {
    process.stdout.write('\x1Bc');
    console.log(colors.silly('========================================'));
    console.log(colors.silly('=    Teneo Community Node - Script     ='));
    console.log(colors.silly('=      Created by (HMS) lester51       ='));
    console.log(colors.silly('=     https://github.com/lester51      ='));
    console.log(colors.silly('========================================'));
    console.log();
}

module.exports = {
    displayHeader,
    getAccessToken,
    connectWebSocket
};