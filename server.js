const express = require('express');
const path = require('path');
const cv = require('opencv4nodejs');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;

var FPS = 25

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({
    server
});

wss.on('connection', (ws, request, client) => {
    ws.on('message', function incoming(message) {
        console.log('[server]Incomming message: %s', message);

        try {
            let m = JSON.parse(message);
            handleMessage(m);
        } catch (err) {
            console.log('[server] Message is not parseable to JSON.');
            broadcast(message);
        }
    });
    ws.on('close', (ws) => {
        console.log('Client disconnected');
    });
});

// ------------------------functions------------------------
function broadcast(msg) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
};

function handleMessage(m) {
    if (m.method == undefined) {
        return;
    }
    let method = m.method;

    if (method) {
        if (handlers[method]) {
            let handler = handlers[method];
            handler(m);
        } else {
            console.log('[server] ### No handler defined for method ' + method + '.');
        }
    }
};

// ------------------------handlers------------------------
let handlers = {
    "handshake": function (m) {
        const wCap = new cv.VideoCapture(1);
        setInterval(() => {
            const frame = wCap.read();
            const imageString = cv.imencode('.jpg', frame).toString('base64');
            broadcast(JSON.stringify({
                method: 'image-feed',
                params: imageString
            }));
        }, 1000 / FPS)
        broadcast('Cam feed has started')
    },
    "engine": function (m) {
        // needs to be implemented
    },
    "barrel": function (m) {
        // needs to be implemented
    },
    "shoot": function (m) {
        // needs to be implemented
    },

};