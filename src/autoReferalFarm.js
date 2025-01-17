const cheerio = require('cheerio');
const axios = require('axios');
const WebSocket = require('ws');
const colors = require('colors/safe');
const path = require('path');
const restartServer = require('./serverControler');
const serverScript = path.resolve(__dirname, '../server.js');

const urlCheckEmail = 'https://auth.teneo.pro/api/check-user-exists';
const urlSignup = 'https://node-b.teneo.pro/auth/v1/signup';
const baseUrl = "https:/\/smailpro.com/";

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

function randomStr (length) {
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
  	    let {
  	  	    headers: {
  	  	  	    'set-cookie': setCookie
  	  	  	}
  	  	} = await axios.get(baseUrl);
        let cookies = setCookie.map(el=>el.split(';')[0]+';');9
        cookies = cookies.join(' ');
        let apiUrl = 'app/payload?url=https%3A%2F%2Fapp.sonjj.com%2Fv1%2Ftemp_email%2Fcreate';
        let {
            data: token
        } = await axios.get(`${baseUrl}${apiUrl}`, {
            headers: {
      	        'cookie': cookies
            }
        });
        let baseApiUrl = 'https:/\/app.sonjj.com/v1/temp_email/';
        let {
            data: {
                email
            }
        } = await axios.get(`${baseApiUrl}create?payload=${token}`);
        return {
            email: email,
            cookie: cookies,
            refreshUrl: `${baseUrl}app/payload?url=${baseApiUrl}inbox&email=${email}`
        }
    }
    catch(e) {
  	    return e;
    }
}

async function getMails(obj,payload) {
    try {
        if (!payload) {
            let {
                data: payload
            } = await axios.get(obj.refreshUrl, {
                headers: {
      	            'cookie': obj.cookie
                }
            });
            let {
                data: refreshToken
            } = await axios.get(`${baseUrl}app/payload?url=https%3A%2F%2Fapp.sonjj.com%2Fv1%2Ftemp_email%2Finbox&email=${obj.email}`);
            let {
                data: {
                    messages
                }
            } = await axios.get(`https:/\/app.sonjj.com/v1/temp_email/inbox?payload=${payload}`);
            return {
                refreshToken: refreshToken,
                messages
            }
        }
        else {
            let {
                data: refreshToken
            } = await axios.get(`${baseUrl}app/payload?url=https%3A%2F%2Fapp.sonjj.com%2Fv1%2Ftemp_email%2Finbox&email=${obj.email}`);
            let {
                data: {
                    messages
                }
            } = await axios.get(`https:/\/app.sonjj.com/v1/temp_email/inbox?payload=${payload}`);
            return {
                refreshToken: refreshToken,
                messages
            }
        }
    }
    catch(e) {
        return e;
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
            throw new Error('Error:', error.response ? error.response.data : error.message);
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
                throw new Error('Error:', error.response ? error.response.data : error.message);
            });
            let res = await getMails(temporaryEmail);
            let refreshToken = res.refreshToken;
            while(true){
                await new Promise(resolve => setTimeout(resolve, 5000));
	            checkMsgs = await getMails(temporaryEmail,refreshToken).catch(e=>{
	   	            throw new Error('Error happened while fetching the messages on this mailbox!')
	            });
	            if (checkMsgs.messages.length == 0)
	                refreshToken = checkMsgs.refreshToken;
	            else
	                break;
            }
            let {
                data: msgToken
            } = await axios.get(`${baseUrl}app/payload?url=https%3A%2F%2Fapp.sonjj.com%2Fv1%2Ftemp_email%2Fmessage&email=${temporaryEmail.email}&mid=${checkMsgs.messages[0].mid}`, {
                headers: {
                    'cookie': temporaryEmail.cookie
                }
            });
            let {
                data: {
                    body
                }
            } = await axios.get(`https:/\/app.sonjj.com/v1/temp_email/message?payload=${msgToken}`);
            let verifyUrlMatch = body.match(/href="([^"]+)"/);
            if (verifyUrlMatch) {
                let encodedUrl = verifyUrlMatch[1];
                verifyEmailUrl = encodedUrl.replace(/&amp;/g, '&');
            }
            else
                throw new Error("No verification URL found in the message body.");
            console.log(verifyEmailUrl);
            //await axios.get(verifyEmailUrl);
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

async function connectSocket(aT, opt) {
    return await new Promise(async(res,rej)=>{
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
    let hb = 0;
    
    const socket = new WebSocket(wsUrl);
    sockets[accessToken] = socket;
    socket.on('open', () => {
        console.log(colors.info.bold('[ INFO ]') + colors.info(' WebSocket connected.'));
        console.log(colors.info.bold("[ CONFIG ]") + "\n" + colors.info('User  ID: ' + uid + "\n" + "Ping Logging: " + config.silentPing));
        console.log();
        startPinging(socket, accessToken);
        res();
    });
    socket.on('message', async(data) => {
        console.log(colors.debug.bold("[ PONG ]") + colors.debug(' Received message: ' + data.toString()));
        hb = data.heartbeats;
        if (hb >= 100) {
            stopPinging(accessToken);
            delete sockets[accessToken];
            console.log(colors.info.bold("[ SYSTEM ]") + colors.info(' Success Referal +1'));
            console.log(colors.warn.bold("[ SYSTEM ]") + colors.warn(' Starting the process again...'));
            setTimeout(() => restartServer(), 3000);
        }
    });
    socket.on('close', () => {
        console.log(colors.warn.bold("[ WARNING ]") + colors.warn(' WebSocket connection closed.'));
        if (hb >= 100) {
            delete sockets[accessToken];
            console.log(colors.warn.bold("[ SYSTEM ]") + colors.warn(' Starting the process again...'));
            setTimeout(() => restartServer(), 3000);
        }
        else {
            delete sockets[accessToken];
            console.log(colors.info.bold("[ INFO ]") + colors.info(' Trying to reconnect...'));
            connectSocket(aT, config);
        }
    });
    socket.on('error', (error) => {
        console.log(colors.error('WebSocket error: ' + error));
        delete sockets[accessToken];
    });
    });
}

function startPinging(socket, accessToken) {
    stopPinging(accessToken);
    pingIntervals[accessToken] = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "PING" }));
            if (!config.silentPing)
                console.log(colors.verbose.bold("[ PONG ]") + colors.verbose(' Ping Message: ' + JSON.stringify({ type: "PING", date: new Date().toISOString() })));
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