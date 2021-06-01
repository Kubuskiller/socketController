const express = require('express');
const path = require('path');
const cv = require('opencv4nodejs');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;

// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

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
        try {
            let m = JSON.parse(message);
            console.log(`[server] ${message}`)
            handleMessage(m);
        } catch (err) {
            console.log('[server] Message is not parseable to JSON.');
            broadcast(message);
        }
    });
    ws.on('close', (ws) => {
        if (!camOpen) {
            wCap.release();
        }
        console.log('Client disconnected');
    });
});


// █░█ ▄▀█ █▄░█ █▀▄ █▀▀ █░░ █▀▀ █▀█ █▀
// █▀█ █▀█ █░▀█ █▄▀ ██▄ █▄▄ ██▄ █▀▄ ▄█

var camOpen = true
var FPS = 25

let handlers = {
    "request-camera": function (m) {
        if (camOpen) {
            const wCap = new cv.VideoCapture(1);
            camOpen = false
            setInterval(() => {
                const frame = wCap.read();
                const imageString = cv.imencode('.jpg', frame).toString('base64');
                broadcast(JSON.stringify({
                    method: 'frame-feed',
                    params: imageString
                }));
            }, 1000 / FPS)
            broadcast('Cam feed has started')
        }
    },
    "rightStick": function (m) {
        // m.params are x & y position + & - intergers
    },
    "leftStick": function (m) {
        // m.params are x & y position + & - intergers
    },
    "shoot": function (m) {
        // FIXME: call python script 
        console.log('[Tank] SHOT HAS BEEN FIRED')
    },
};


// █▀▀ █░█ █▄░█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▀░ █▄█ █░▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█

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

function broadcast(msg) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
};

//call this function from python
function hit(dmg) {
    broadcast(JSON.stringify({
        method: 'impact',
        params: dmg
    }));
};