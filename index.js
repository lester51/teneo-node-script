const colors = require('colors/safe'),
axios = require('axios'),
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

let pingInterval, config, accessToken, socket = null;

async function getAccessToken(creds) {
  console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Please wait while logging you in . . .\n`));
  let {data} = await axios.post('https:/\/auth.teneo.pro/api/login', {
    'email': creds.email,
    'password': creds.pass
  }, {
    headers: {
	  /*
	  UNCOMMENT THIS PARAMETERS FOR HEADERS
	  IF YOU ARE FACING ISSUES IN REQUEST LIKE
	  CLOUDFLARE, ETC.
	  */
	  'authority': 'auth.teneo.pro',
	  //'accept-language': 'en-US,en;q=0.9',
      'origin': 'https://dashboard.teneo.pro',
      'referer': 'https://dashboard.teneo.pro/',
      //'sec-ch-ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
      //'sec-ch-ua-mobile': '?0',
      //'sec-ch-ua-platform': '"Linux"',
      //'sec-fetch-dest': 'empty',
      //'sec-fetch-mode': 'cors',
      //'sec-fetch-site': 'same-site',
      //'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'x-api-key': 'OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA'
    }
  });
  return data;
}

function connectWebSocket(aT,opt) {
  config = opt || false;
  if (socket) return;
  if (typeof aT === 'object') {
    accessToken = aT.access_token;
    uid = aT.user.id;
  }
  else {
    accessToken = aT;
    uid = null;
  }
  let version = "v0.2";
  let url = "wss://secure.ws.teneo.pro";
  let wsUrl = `${url}/websocket?accessToken=${encodeURIComponent(accessToken)}&version=${encodeURIComponent(version)}`;
  socket = new WebSocket(wsUrl);

  socket.on('open', () => {
    console.log(colors.info.bold('[ INFO ]')+colors.info(' WebSocket connected'));
    console.log(colors.info.bold("[ CONFIG ]")+"\n"+colors.info('UserID: '+uid+"\n"+"Ping Logging: "+config.silentPing));
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
    connectWebSocket(aT,config)
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

module.exports = {
  delay,
  displayHeader,
  getAccessToken,
  connectWebSocket
};