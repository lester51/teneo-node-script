const cheerio = require('cheerio');
const axios = require('axios');
const WebSocket = require('ws');
const colors = require('colors/safe');
const path = require('path');
const restartServer = require('./serverControler');
const serverScript = path.resolve(__dirname, '../server.js');

/*require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});*/

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

async function createEmail(name) {
    try {
        return name+randomStr(3)+"@maildrop.cc";
    }
    catch(e) {
        return e;
    }
}

async function getMails(mail) {
    try {
 	    let url = 'https:/\/api.maildrop.cc/graphql';
 	    let dataInbox = {
 	 	    operationName: "GetInbox",
            variables: {
                mailbox: mail.split('@')[0]
            },
            query: `query GetInbox($mailbox: String!) {
                ping(message: "Test")
                inbox(mailbox: $mailbox) {
                    id
                    subject
                    date
                    headerfrom
                    __typename
                }
                altinbox(mailbox: $mailbox)
            }`
        };
        let msg;
        while (true) {
            let { data: { data } } = await axios.post(url, dataInbox)
            .catch(error => {
                throw new Error('Error fetching data:', error);
            });
            if (data.inbox.length > 0 && !!data.inbox[0].headerfrom.match(/teneo/i)) {
                msg = data.inbox;
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
 	    let dataMessage = {
  	        operationName: "GetMessage",
            variables: {
                mailbox: mail.split('@')[0],
                id: msg[0].id
            },
            query: `query GetMessage($mailbox: String!, $id: String!) {
                message(mailbox: $mailbox, id: $id) {
                    id
                    subject
                    date
                    headerfrom
                    data
                    html
                    __typename
                }
            }`
        };
        let { data: { data: { message } } } = await axios.post(url, dataMessage)
        .catch(error => {
            throw new Error('Error fetching data:', error);
        });
        require('fs').writeFileSync('./test.html',message.html,'utf8');
        return message.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g, '&').split('&').slice(0,-1).join('&')+"&redirect_to=https://dashboard.teneo.pro/auth/verify";
        //return msg.data.content.match(/href="([^"]+)"/)[1].replace(/&amp;/g, '&');
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
        let fullName = name[0]+name[2];
        let temporaryEmail = fullName+randomStr(3)+"@maildrop.cc";
        let isExisting = await axios.post(urlCheckEmail, {
            email: temporaryEmail
        }, {
	        headers: headersCheckEmail
        }).then(response=>response.data.exists)
        .catch(error => {
            throw new Error('Error:', error.response ? error.response.data : error.message);
        });
        if (!isExisting) {
	        let password = name[0]+randomStr(4);
            let signup = await axios.post(urlSignup, {
                email: temporaryEmail,
                password: password,
                data: {
                    invited_by: referalCode
                },
                gotrue_meta_security: {},
                code_challenge: null,
                code_challenge_method: null
            }, {
    	        headers: headersRegister
    	    }).then(response => response)
    	    .catch(error => {
                throw new Error('Error:', error.response ? error.response.data : error.message);
            });
            console.log(signup)
            let verifyEmailUrl = await getMails(temporaryEmail);
            console.log(verifyEmailUrl)
            let test = await axios.get(verifyEmailUrl, {
                withCredentials: true
            }).catch(e=>e);
            console.log(test)
            console.log("~• Account Creation Success •~\n\nemail: "+temporaryEmail+"\npass: "+password);
            return {
                email: temporaryEmail,
                pass: password
            };
        }
    }
    catch(e){
        console.error(e);
    }
}

async function connectSocket(aT, server, opt) {
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
            setTimeout(() => restartServer(server), 3000);
        }
    });
    socket.on('close', () => {
        console.log(colors.warn.bold("[ WARNING ]") + colors.warn(' WebSocket connection closed.'));
        if (hb >= 100) {
            delete sockets[accessToken];
            console.log(colors.warn.bold("[ SYSTEM ]") + colors.warn(' Starting the process again...'));
            setTimeout(() => restartServer(server), 3000);
        }
        else {
            delete sockets[accessToken];
            console.log(colors.info.bold("[ INFO ]") + colors.info(' Trying to reconnect...'));
            connectSocket(aT, server, config);
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