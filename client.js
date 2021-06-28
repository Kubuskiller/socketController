// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

//Upgrade to websocket protocol
const hostIP = 'localhost'
const ws = new WebSocket('ws://' + hostIP + ':3000');

//Listeners on incomming events
ws.addEventListener("open", () => {

    // Request camera feed on connection
    ws.send(JSON.stringify({
        method: 'request-camera'
    }));
    console.log('[client] Stream requested.');
});

ws.addEventListener('message', (e) => {
    try {
        let m = JSON.parse(e.data);
        handleMessage(m);
    } catch (err) {
        console.log('[server] Incomming message: ' + e.data + err);
    }
});
ws.addEventListener('close', () => {
    console.log('[client] Connection closed.');
});
ws.onerror = (err) => {
    if (err.code == 'EHOSTDOWN') {
        console.log('[client] Error: server down.');
    }
};


// █░█ ▄▀█ █▄░█ █▀▄ █▀▀ █░░ █▀▀ █▀█ █▀
// █▀█ █▀█ █░▀█ █▄▀ ██▄ █▄▄ ██▄ █▀▄ ▄█

let handlers = {
    "frame-feed": function (m) {

        // update frame on recieval and show latency
        const imageElm = document.getElementById('image-feed');
        imageElm.src = `data:image/jpeg;base64,${m.params.img}`;
        document.getElementById('ping').innerHTML = Date.now() - m.params.ping;
    },
    "impact": function (m) {
        lifes -= m.params.dmg;
        document.getElementById('lifes').innerHTML = lifes;
    }
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

function shoot() {
    // Request the server to shoot and lose a ammo
    ws.send(JSON.stringify({
        method: 'shoot'
    }));
    ammo -= 1;
    document.getElementById('ammo').innerHTML = ammo;
}


// █▀▀ ▄▀█ █▀▄▀█ █▀▀
// █▄█ █▀█ █░▀░█ ██▄

var ammo = 25;