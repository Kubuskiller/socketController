// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener("open", () => {
    console.log('[Client] Connection to WebSocket server was opened.');

    // request camfeed
    ws.send(JSON.stringify({
        method: 'request-camera',
        params: ''
    }));
});

ws.addEventListener('message', (e) => {
    try {
        let m = JSON.parse(e.data);
        // remove string frames from client log
        if (m.method != 'frame-feed') {
            console.log('[client] ' + e.data);
        }
        handleMessage(m);
    } catch (err) {
        console.log('[client] ' + e.data);
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
            console.log('[client] ### No handler defined for method ' + method + '.');
        }
    }
};

let handlers = {
    "frame-feed": function (m) {
        const imageElm = document.getElementById('image-feed');
        imageElm.src = `data:image/jpeg;base64,${m.params}`;
    },
    "impact": function (m) {
        // blink screen and remove life from lifebar
    }
};

// █▀▀ █░█ █▄░█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▀░ █▄█ █░▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█

function shoot(){
    console.log('hi')
}