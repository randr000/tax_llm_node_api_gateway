require('dotenv').config();
const { createHash } = require('node:crypto');
const cors = require('cors');
const express = require('express');


const app = express();
app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}

app.use(cors(corsOptions));

const {
    PORT,
    DB_AND_EMAIL_SERVICE_INTERFACE_HOST,
    DB_AND_EMAIL_SERVICE_INTERFACE_PORT,
    RAG_SERVICE_INTERFACE_HOST,
    RAG_SERVICE_INTERFACE_PORT
} = process.env;

const store = {};

app.post('/query', async (req, res) => {
    try {
        const postReqPayload = {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({query: req.body.query.slice(0, 300)})
        };

        const ragResponse = await fetch(`http://${RAG_SERVICE_INTERFACE_HOST}:${RAG_SERVICE_INTERFACE_PORT}/query`, postReqPayload);
        const ragJson = await ragResponse.json();
        ragJson.response = ragJson.response.trim().slice(0, 5000);
        const hashKey = createHash('sha256').update(`${new Date()}${Math.random() * 1000}${ragJson.query}${ragJson.response}`).digest('hex');
        store[hashKey] = {userMsg: ragJson.query, botMsg: ragJson.response};
        res.send({hashKey: hashKey, botResponse: ragJson.response});

    } catch (error) {
        // To be implemented later
        console.log(error);
        res.send(error);
    }
});

app.post('/rating', async (req, res) => {
    try {

        const {hashKey, userMsg, botMsg, ratingValue = null} = req.body;

        if (hashKey in store === false) {
            res.send({'msg': 'Incorrect hash sent with rating. Failed to send rating.', 'hash': hashKey});

        } else if (!(ratingValue === 'correct' || ratingValue === 'partial' || ratingValue === 'incorrect')) {
            res.send({'msg': 'Invalid rating value sent. Failed to send rating.', 'ratingValue': ratingValue});

        } else if (store[hashKey].userMsg === userMsg && store[hashKey].botMsg === botMsg) {

            const postReqPayload = {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({userMsg: userMsg, botMsg: botMsg, ratingValue: ratingValue})
            };
    
            const dbResponse = await fetch(`http://${DB_AND_EMAIL_SERVICE_INTERFACE_HOST}:${DB_AND_EMAIL_SERVICE_INTERFACE_PORT}/rating`, postReqPayload);
            const dbJson = await dbResponse.json();

            delete store[hashKey];
            if (dbJson.status) res.send({'msg': 'Rating sent successfully.'});
            else res.send({'msg': 'Failed to send rating successfully.'});
            

        } else {
            res.send({
                'msg': 'Either original user message or bot response was changed. Failed to send rating.',
                'userMsg': userMsg,
                'botMsg': botMsg
            });
        }


    } catch (error) {
        // To be implemented later
        console.log(error);
        res.send(error);
    }
});

app.get('/getstore', (req, res) => {
    res.send({store: store});
});

app.listen(PORT);