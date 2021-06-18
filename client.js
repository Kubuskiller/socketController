// █▀▀ ▄▀█ █▀▄▀█ █▀▀
// █▄█ █▀█ █░▀░█ ██▄

var lifes = 500;
var ammo = 25;


// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener("open", () => {
    console.log('[client] Connected to websocket.');
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
        console.log('[server] Incomming message: ' + e.data);
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
        const imageElm = document.getElementById('image-feed');
        imageElm.src = `data:image/jpeg;base64,${m.params.img}`;
        document.getElementById('ping').innerHTML = Date.now() - m.params.ping;
    },
    "impact": function (m) {
        lifes -= m.params.dmg;
        document.getElementById('lifes').innerHTML = lifes;
        //show impact visuals on HTML
    }
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
            console.log('[client] No handler defined for method ' + method + '.');
        }
    }
};

function shoot() {
    ws.send(JSON.stringify({
        method: 'shoot'
    }));
    ammo -= 1;
    document.getElementById('ammo').innerHTML = ammo;
}