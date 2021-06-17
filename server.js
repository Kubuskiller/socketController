const path = require('path');
var spawn = require('child_process').spawn;

const cv = require('opencv4nodejs');

const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;

// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Websocket listening on port: ${ PORT }`));

const wss = new SocketServer({
    server
});

wss.on('connection', (ws, request, client) => {
    ws.on('message', function incoming(message) {
        try {
            let m = JSON.parse(message);
            handleMessage(m);
        } catch (err) {
            console.log(`[server] ERROR: ${message} --> ${err}`);
        }
    });
    ws.on('close', (ws) => {
        console.log('Client disconnected');
    });
});


// █░█ ▄▀█ █▄░█ █▀▄ █▀▀ █░░ █▀▀ █▀█ █▀
// █▀█ █▀█ █░▀█ █▄▀ ██▄ █▄▄ ██▄ █▀▄ ▄█

const wCap = new cv.VideoCapture(1);
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 1280)
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 720)
var camOpen = true
var FPS = 18

let handlers = {
    "request-camera": function (m) {
        if (camOpen == true) {
            camOpen = false;
            setInterval(() => {
                try {
                    const frame = wCap.read();
                    const imageString = cv.imencode('.jpg', frame).toString('base64');
                    broadcast(JSON.stringify({
                        method: "frame-feed",
                        params: {
                            ping: Date.now(), 
                            img: imageString
                        }}
                    ));
                } catch (err) {
                    console.log(err);
                }
            }, 1000 / FPS)
            broadcast('Stream is open')
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
            console.log('[server] No handler defined: ' + method + '.');
        }
    }
};

function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
};

//call this function from python on impact
function hit(impact) {
    console.log('[tank] Took' + impact + 'damage or lifes?');
    broadcast(JSON.stringify({
        method: 'impact',
        params: {
            dmg: impact
        }
    }));
};