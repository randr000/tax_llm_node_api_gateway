require('dotenv').config();
const { createHash } = require('node:crypto');
const express = require('express');


const app = express();
app.use(express.json());

const store = {};

app.post('/post', (req, res) => {
    const { userMsg, botMsg } = req.body;
    const hashKey = createHash('sha256').update(`${new Date()}${Math.random() * 100000}${userMsg}${botMsg}`).digest('hex');
    store[hashKey] = req.body;
    res.send({hashKey: hashKey, ...req.body});
});

app.get('/get', (req, res) => {
    const key = req.body.key;
    res.send(key in store ? {key: true} : {key: false});
});

app.get('/getstore', (req, res) => {
    res.send({store: store});
});

app.listen(process.env.PORT);