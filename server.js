var spawn = require('child_process').spawn;
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
            console.log(`[server] ERROR: ${err} #----# ${message}`);

        }
    });
    ws.on('close', (ws) => {
        console.log('Client disconnected');
    });
});


// █░█ ▄▀█ █▄░█ █▀▄ █▀▀ █░░ █▀▀ █▀█ █▀
// █▀█ █▀█ █░▀█ █▄▀ ██▄ █▄▄ ██▄ █▀▄ ▄█

const wCap = new cv.VideoCapture(1);
var camOpen = true
var FPS = 28

let handlers = {
    "request-camera": function (m) {
        if (camOpen == true) {
            camOpen = false;
            setInterval(() => {
                try {
                    const frame = wCap.read();
                    const imageString = cv.imencode('.jpg', frame).toString('base64');
                    broadcast(JSON.stringify({
                        method: 'frame-feed',
                        params: {
                            ping: Date.now(),
                            img: imageString
                        }
                    }));
                } catch (err) {
                    console.log(err);
                }
            }, 1000 / FPS)
            broadcast('Cam feed has started')
        }
    },
    "rightStick": function (m) {
        spawn('python', ['./Rstick.py', m.params.x, m.params.y]);
    },
    "leftStick": function (m) {
        spawn('python', ['./Lstick.py', m.params.x, m.params.y]);

    },
    "shoot": function (m) {
        spawn('python', ['./shoot.py']);
        console.log('[tank] just backfired');
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

//call this function from python on impact
function hit(impact) {
    console.log('[tank] Was hit by a bullet ?or something else?');
    broadcast(JSON.stringify({
        method: 'impact',
        params: {
            dmg: impact}
    }));
};