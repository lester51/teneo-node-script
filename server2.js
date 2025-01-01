const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, async() => {

});