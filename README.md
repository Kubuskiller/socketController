# socketController
A websocket server that inited to be run on Raspberry Pi, to recieve input that controls the motors connected to it. And a HTML client-side with joysticks as input and recieves a constant stream of the cam from the server (raspberry).


# How to use #
1. clone repo
2. npm install 
3. wait and hope for openCV4nodejs ( big library (1.5gb) and pain in the ass I needed windows build tool aswell)
   FIX: try 'npm install -g windows-build-tools' before 'npm install opencv4nodejs'
4. Copy path of server.js -> run 'node {path}' in cmd *make sure port 3000 is not used or change the port used for the WebSocket*
5. run live server on localhost and open index.html

