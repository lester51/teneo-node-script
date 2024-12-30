const colors = require('colors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const {
    delay,
    displayHeader,
    getAccessToken,
    connectWebSocket
} = require('./index');
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
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let email = process.env.EMAIL;
let pass = process.env.PASSWORD;

app.get('/', (req, res) => {
  res.send('SERVER FOR GRASS NODE AUTOFARMING SCRIPT\nMADE\nBY\nHackMeSenpai(HMS)')
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './public', 'login.html'));
});

app.listen(port, async() => {
  displayHeader();
  let loginInfo = await getAccessToken({email: email, pass: pass});
  console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[loginInfo.user.id].length} user IDs\n`));
  await delay(1000);
  //let loginToken = getAccessToken({email: email, pass: pass});
  connectWebSocket(loginInfo,{
    silentPing: true
  });
})

module.exports = app;
