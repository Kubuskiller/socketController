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

// Open a server and enables websocket protocol
const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Websocket listening on port: ${ PORT }`));
const wss = new SocketServer({
    server
});

//Listeners on incomming events
wss.on('connection', (ws, request, client) => {

    console.log('Client connected')

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


//Enable the capture object with starting the server
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
                    // Try to read and encode a frame from the capture object 
                    const frame = wCap.read();
                    const imageString = cv.imencode('.jpg', frame).toString('base64');

                    // Send the frame with a timestamp 
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
        // Call a python script to drive
        spawn('python', ['./Rstick.py', m.params.x, m.params.y]);
        console.log('[tank] moving X: ' + m.params.x + 'Y: ' + m.params.y);
    },
    "leftStick": function (m) {
        // Call a python script to move the barrel
        spawn('python', ['./Lstick.py', m.params.x, m.params.y]);
        console.log('[tank] barrel X: ' + m.params.x + 'Y: ' + m.params.y);
    },
    "shoot": function (m) {
        //Call a python script to shoot
        spawn('python', ['./shoot.py']);
        console.log('[tank] fired');
    },
};


// █▀▀ █░█ █▄░█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▀░ █▄█ █░▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█

function handleMessage(m) {
    // Look if JSON has a method object
    if (m.method == undefined) {
        return;
    }

    let method = m.method;

    if (method) {

        // Check if method is described
        if (handlers[method]) {

            // Excecute appropiate function
            let handler = handlers[method];
            handler(m);
        } else {
            console.log('[server] No handler defined: ' + method + '.');
        }
    }
};

// Give all clients the same message 
function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
};

//Send impact information to the client
function hit(impact) {
    console.log('[tank] Took' + impact + 'damage or lifes?');
    broadcast(JSON.stringify({
        method: 'impact',
        params: {
            dmg: impact
        }
    }));
};