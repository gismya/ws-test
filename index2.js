const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(function (req, res) {
    res.send({});
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('open', function open() {
        console.log('connected');
    });

    ws.on('close', function close() {
        console.log('disconnected');
    });

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                console.log('Stale connection terminating.');
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping('', false, true);
        });
    }, 10000);

    console.log('First connected');
    ws.send('{}');
});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});