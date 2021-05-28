const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener("open", () => {
    console.log('[Client] Connection to WebSocket server was opened.');

    ws.send(JSON.stringify({
        method: 'handshake'
    }));
});

ws.addEventListener('message', (e) => {
    try {
        let m = JSON.parse(e.data);
        handleMessage(m);
    } catch (err) {
        console.log('[client] Not parseable to JSON:' + e.data);
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


// ------------------------handlers------------------------

let handlers = {
    "image-feed": function (m) {
        const imageElm = document.getElementById('image');
        imageElm.src = `data:image/jpeg;base64,${m.params}`;
    },
    "impact": function (m) {
        // needs to be implemented
    }
};