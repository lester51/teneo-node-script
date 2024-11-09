const colors = require('colors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const {
    delay,
    displayHeader,
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
const express = require('express');
const app = express();
const port = 3000;

let uid = process.env.UID;

app.get('/', (req, res) => {
  res.send('SERVER FOR GRASS NODE AUTOFARMING SCRIPT\nMADE\nBY\nHackMeSenpai(HMS)')
})

app.listen(port, async() => {
  displayHeader();
  console.log(colors.info.bold("[ SYSTEM ]")+colors.info(` Loaded ${[uid].length} user IDs\n`));
  await delay(1000);
  connectWebSocket(uid,{
    silentPing: true
  });
})

module.exports = app;
