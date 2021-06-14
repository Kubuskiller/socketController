// █▀▀ ▄▀█ █▀▄▀█ █▀▀
// █▄█ █▀█ █░▀░█ ██▄

var lives = 500;
var ammo = 25;


// █░█░█ █▀▀ █▄▄ █▀ █▀█ █▀▀ █▄▀ █▀▀ ▀█▀
// ▀▄▀▄▀ ██▄ █▄█ ▄█ █▄█ █▄▄ █░█ ██▄ ░█░

const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener("open", () => {
    
    console.log('[Client] Connection to WebSocket server was opened.');
    ws.send(JSON.stringify({
        method: 'request-camera'
    }));    
});    

ws.addEventListener('message', (e) => {
    try {
        let m = JSON.parse(e.data); 
        handleMessage(m);
    } catch (err) {
        console.log('[client] Incomming message is not parseable to JSON. ' + err);
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
        sendTime = m.params.ping
        pingDiff = Date.now() - sendTime
        document.getElementById('ping').innerHTML = pingDiff;
    },    
    "impact": function (m) {
        damage = m.params.dmg 
        lives -= damage;
        document.getElementById('ammo').innerHTML = lives;

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
            console.log('[client] ### No handler defined for method ' + method + '.');
        }    
    }    
};    

function shoot(){
    ws.send(JSON.stringify({
        method: 'shoot'
    }));    
    ammo -= 1;
    document.getElementById('ammo').innerHTML = ammo;

}    

