class Server {
    async startServer() {
        const colors = require('colors');
        const path = require('path');
        const bodyParser = require('body-parser');
        const cors = require('cors');
        const express = require('express');
        const {
            displayHeader,
            getAccessToken,
            connectWebSocket
        } = require('./src/index');
        const {
            createAccount,
            connectSocket
        } = require('./src/autoReferalFarm');
        const port = process.env.PORT || 3000;

        require('dotenv').config({
            path: path.resolve(__dirname, './.env')
        });
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

        const app = express();
        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(express.static(path.join(__dirname, 'public')));

        app.get('/', (req, res) => {
            res.send('SERVER FOR TENEO COMMUNITY NODE AUTOFARMING SCRIPT\nMADE\nBY\nHackMeSenpai(HMS)')
        });

        app.get('/login', (req, res) => {
            res.sendFile(path.join(__dirname, './public', 'login.html'));
        });

        //FOR HEARTBEAT POINTS FARMING
        app.listen(3000, async() => {
            let token = process.env.TOKEN;
            displayHeader();
            console.log(colors.verbose.bold("[ SERVER ]")+colors.info(`Server for heartbeat is open at port ${port}`));
            if (process.env.TOKEN || process.env.TOKEN != null) {
                if (token.startsWith("[") && token.endsWith("]")) {
	                let tokenList = token.slice(1,-1).split(',').map(el=>el.replace(/ /g,""));
                    for (const token of tokenList) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        connectWebSocket(token,{
                            silentPing: true
                        })
                    }
                }
                else {
                    loginInfo = process.env.TOKEN
                    connectWebSocket(loginInfo,{
                        silentPing: true
                    });
                }
            }
            else {
                let email = process.env.EMAIL;
                let pass = process.env.PASSWORD;
                let loginInfo = await getAccessToken({email: email, pass: pass});
                console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[loginInfo.user.id].length} user IDs\n`));
                connectWebSocket(loginInfo,{
                    silentPing: true
                });
            }
        });

        //FOR REFERAL POINTS FARMING
        let refServ = app.listen(port+1, async() => {
            console.log(colors.verbose.bold("[ SERVER ]")+colors.info(`Server for auto referal is open at port ${port+1}`));
            let creds = await createAccount(process.env.REFCODE);
            let loginInfo = await getAccessToken({email: creds.email, pass: creds.pass});
            console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[loginInfo.user.id].length} user IDs\n`));
            //console.log(refServ)
            connectSocket(loginInfo, refServ,{
                silentPing: true
            });
        });
        /*let PORT = port;
        let refCode = process.env.REFCODE;
        if (refCode.startsWith("[") && refCode.endsWith("]")) {
	        let refCodeList = refCode.slice(1,-1).split(',').map(el=>el.replace(/ /g,""));
            let appVars = [];
            const apps = {};
            for (let i = 0; i < refCodeList.length; ++i) {
	            appVars.push(`app${i+1}`);
            }
            appVars.forEach(appVars => {
                apps[appVars] = express();
            });
                await new Promise(resolve => setTimeout(resolve, 2000));
                appVars.forEach(appVars => {
                    let openPorts = PORT+=1;
	                
                    apps[appVars].listen(openPorts, async() => {
                        console.log(colors.verbose.bold("[ SERVER ]")+colors.info(`Server for auto referal is open at port ${openPorts}`));
                        let creds = await createAccount(refCode);
                        let loginInfo = await getAccessToken({email: creds.email, pass: creds.pass});
                        console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[loginInfo.user.id].length} user IDs\n`));
                        connectSocket(loginInfo,{
                            silentPing: true
                        });
                    });
                });
        }
        else {
            app.listen(PORT+1, async() => {
            console.log(colors.verbose.bold("[ SERVER ]")+colors.info(`Server for auto referal is open at port ${port+1}`));
            let creds = await createAccount(refCode);
            let loginInfo = await getAccessToken({email: creds.email, pass: creds.pass});
            console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[loginInfo.user.id].length} user IDs\n`));
            connectSocket(loginInfo,{
                silentPing: true
            });
        });
        }*/
    }
}

module.exports = new Server();