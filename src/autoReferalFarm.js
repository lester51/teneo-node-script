const cheerio = require('cheerio');
const axios = require('axios');
const WebSocket = require('ws');
const colors = require('colors/safe');
const {
  serverReferal,
  serverInstance
} = require('../server');

const urlCheckEmail = 'https://auth.teneo.pro/api/check-user-exists';
const urlSignup = 'https://node-b.teneo.pro/auth/v1/signup';

const headersCheckEmail = {
  'authority': 'auth.teneo.pro',
  'origin': 'https://dashboard.teneo.pro',
  'referer': 'https://dashboard.teneo.pro/',
  'x-api-key': 'OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA'
};

const headersRegister = {
  'authority': 'node-b.teneo.pro',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag',
  'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag',
  'origin': 'https://dashboard.teneo.pro',
  'referer': 'https://dashboard.teneo.pro/',
  'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Linux"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.40 Safari/537.36',
  'x-client-info': 'supabase-js-web/2.47.10',
  'x-supabase-api-version': '2024-01-01'
};

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

let pingIntervals = {}, config, accessToken, sockets = {};

let randomStr = (length) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

async function createEmail() {
  try {
    const response = await axios.post('https://api.internal.temp-mail.io/api/v3/email/new', {
      min_name_length: 10,
      max_name_length: 10
    });
    return response.data;
  } catch (error) {
    console.error('Error creating email:', error);
  }
}

async function getMails(email) {
  try {
    const response = await axios.get(`https://api.internal.temp-mail.io/api/v3/email/${email}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error creating email:', error);
  }
}

async function createAccount(referalCode) {
    try {
        let res = await axios.get('https:/\/www.behindthename.com/random/random.php?gender=both&number=2&sets=1&surname=&all=yes').catch(e=>{
            throw new Error(`An unexpexted error while making request.\n\nError Logs: ${String(e)}`)
        })
        let $ = cheerio.load(res.data)
        let name = $('div[class=random-results]').text().trim().trimStart().split(' ')
        let fullName = name[0]+name[2]
        let temporaryEmail = await createEmail()
        let isExisting = await axios.post(urlCheckEmail, {
            email: temporaryEmail.email
        }, {
	        headers: headersCheckEmail
        }).then(response=>response.data.exist)
        .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
        });
        if (!isExisting) {
	        let password = name[0]+randomStr(4);
            let signup = await axios.post(urlSignup, {
                email: temporaryEmail.email,
                password: password,
                data: {
                    invited_by: referalCode
                },
                gotrue_meta_security: {},
                code_challenge: null,
                code_challenge_method: null
            }, {
    	        headers: headersRegister
    	    }).then(response => response.data)
    	    .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
            });
            while(true){
	            checkMsgs = await getMails(temporaryEmail.email).catch(e=>{
	   	            throw new Error('Error happened while fetching the messages on this mailbox!')
	            });
	            if(checkMsgs.length==1) break;
	            await new Promise(resolve => setTimeout(resolve, 5000));
            }
            let verifyEmailUrl = checkMsgs[0].body_text.match(/\[.*\]/gi)[1].slice(1,-1);
            await axios.get(verifyEmailUrl);
            console.log("~• Account Creation Success •~\n\nemail: "+temporaryEmail.email+"\npass: "+password);
            return {
                email: temporaryEmail.email,
                pass: password
            };
        }
    }
    catch(e){
        console.error(e);
    }
}

function connectSocket(aT, opt) {
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
        if (data.heartbeats == 100) {
            stopPinging(accessToken);
            delete sockets[accessToken];
            serverInstance.close(() => {
                console.log(colors.warn.bold("[ PONG ]") + colors.warn('Closed out remaining connections on auto referal server'));
                console.log(colors.debug.bold("[ SYSTEM ]") + colors.debug(' Server is restarting in 3 sec...'));
                setTimeout(() => {
                    // Restart the server
                    serverInstance = serverReferal();
                }, 3000); // 3 seconds
            });
        }
    });

    socket.on('close', () => {
        console.log(colors.warn.bold("[ WARNING ]") + colors.warn(' WebSocket connection closed.'));
        if (hb >= 111) delete sockets[accessToken];
        else {
            console.log(colors.info.bold("[ INFO ]") + colors.info(' Trying to reconnect...'));
            connectSocket(aT, config);
        }
    });

    socket.on('error', (error) => {
        console.log(colors.error('WebSocket error: ' + error));
        delete sockets[accessToken];
    });
}

function startPinging(socket, accessToken) {
    stopPinging(accessToken); // Stop any existing ping interval for this token
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

module.exports = {
    createAccount,
    connectSocket
};