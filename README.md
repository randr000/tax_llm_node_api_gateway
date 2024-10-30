# Tax RAG App - API Gateway

### This service routes requests to either the [Chat](https://github.com/randr000/tax_llm) service or [Database and Mailer](https://github.com/randr000/tax_llm_node_app) service

Install project dependencies:
```bash
npm install
```
Copy sample.env:
```bash
cp sample.env .env
```
Add environment variable values to .env file:
```
PORT=<Port for server to listen on>
DB_AND_EMAIL_SERVICE_INTERFACE_HOST=<localhost or docker service name>
DB_AND_EMAIL_SERVICE_INTERFACE_PORT=<Port for db and email service>
RAG_SERVICE_INTERFACE_HOST=<localhost or docker service name>
RAG_SERVICE_INTERFACE_PORT=<Port for Chat service>
```

#### A post request made to the API path "/query"
Sample request object:
```js
{"query": "How many filing statuses are there?"}
```
When a request is received, a hashkey string is created and the user's query and the bot's response are stored in a key-value database. This is used to later determine that a rating received belongs to the correct user query and bot response.<br><br>
Sample response object:
```js
{
    "hashKey": <"sha256 hash string">,
    "botResponse": "There are five filing statuses: Single, Married filing jointly, Married filing separately, Head of household, and Qualifying surviving spouse."
}
```


#### A post request made to the API path "/rating"
Sample request object:
```js
{
    "hashKey": <"sha256 hash string">,
    "useMsg": "How many filing statuses are there?",
    "botMsg": "There are five filing statuses: Single, Married filing jointly, Married filing separately, Head of household, and Qualifying surviving spouse.",
    "ratingValue": <"correct" or "partial" or "incorrect" or null>
}
```
Sample response object if request was successful:
```js
{
    "msg": "Rating sent successfully."
}
```
Sample response object if hashKey was not in key-value database:
```js
{
    "msg": "Incorrect hash sent with rating. Failed to send rating.",
    "hash": <"sha256 hash string that was sent with request">
}
```
Sample response object if invalid rating value was sent:
```js
{
    "msg": "Invalid rating value sent. Failed to send rating.",
    "ratingValue": <"Invalid rating value string that was sent with request">
}
```
Sample response object if the incorrect userMsg or botMsg was sent with the wrong hashKey:
```js
{
    "msg": "Either original user message or bot response was changed. Failed to send rating.",
    "userMsg": <"Original userMsg that was sent with request">,
    "botMsg": <"Original botMsg that was sent with request">
}
```
Sample response object if there were any other issues with request:
```js
{
    "msg": "Failed to send rating successfully.",
}
```
To start the API gateway:
```bash
node server.js
```

It is recommended to run this service within a Docker container. The Dockerfile located in the project's root directly can be used to create the image.

## Front-End Links
[Front-End Site Live](https://taxragapp.vercel.app/)<br>
[Front-End Site README](https://github.com/randr000/tax_llm_next_app)