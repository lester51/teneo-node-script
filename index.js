const colors = require('colors/safe'),
WebSocket = require('ws');

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

let pingInterval, config, userid, socket = null;

function connectWebSocket(uid,opt) {
  config = opt || false;
  userid = uid;
  if (socket) return;
  let userId = uid;
  let version = "v0.2";
  let url = "wss://secure.ws.teneo.pro";
  let wsUrl = `${url}/websocket?userId=${encodeURIComponent(userId)}&version=${encodeURIComponent(version)}`;
  let headers = {
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
    "sec-websocket-version": "13"
  };

  socket = new WebSocket(wsUrl,{
    headers: headers
  });

  socket.on('open', () => {
    console.log(colors.info.bold('[ INFO ]')+colors.info(' WebSocket connected'));
    console.log(colors.info.bold("[ CONFIG ]")+"\n"+colors.info('UserID: '+userid+"\n"+"Ping Logging: "+config.silentPing));
    console.log();
    startPinging();
  });

  socket.on('message', (data) => {
    console.log(colors.debug.bold("[ PONG ]")+colors.debug(' Recieved message: '+data.toString()));
  });

  socket.on('close', () => {
    console.log(colors.warn.bold("[ WARNING ]")+colors.warn(' WebSocket connection closed'));
    socket = null;
    console.log(colors.info.bold("[ INFO ]")+colors.info(' Trying to reconnect...'));
    connectWebSocket(uid,config)
  });

  socket.on('error', (error) => {
    console.log(colors.error('WebSocket error: '+error));
    socket = null;
  });
}

function startPinging() {
  stopPinging();
  pingInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "PING" }));
      if (!config.silentPing) console.log(colors.verbose.bold("[ PONG ]")+colors.verbose(' Ping Message: '+JSON.stringify({ type: "PING", date: new Date().toISOString()})));
    }
  }, 15000);
}

function stopPinging() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

let delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function displayHeader() {
  process.stdout.write('\x1Bc');
  console.log(colors.silly('========================================'));
  console.log(colors.silly('=    Teneo Community Node - Script     ='));
  console.log(colors.silly('=      Created by (HMS) lester51       ='));
  console.log(colors.silly('=     https://github.com/lester51      ='));
  console.log(colors.silly('========================================'));
  console.log();
}

module.exports = { delay, displayHeader, connectWebSocket };