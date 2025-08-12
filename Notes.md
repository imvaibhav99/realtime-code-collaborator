In root directory->npm init -y ->accepts all the default values while installing the npm and create a package.json in root.->npm i ex
press socket.io -> npm i -D
 nodemon

->create frontend and backend folders in the root directory.


Frontend setup->npm create vite@latest . ->npm i -> npm i socket.io-client



Backend setup->In root->package.json:
  <!-- "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node backend/index.js",
    "dev": "nodemon backend/index.js"

}, -->

Socket.io is created using http server:
<!-- import {Server} from 'socket.io';
const server = http.createServer(app); -->

<!-- io.on("connection", (socket)=>{
    console.log("User connected:", socket.id);
    
}) -->. Allowing all the origin of cors
<!-- io.on("connection", (socket)=>{
    console.log("User connected:", socket.id); 
    
}) --> When a client connect to the server,a new socket id is automatically creaated from socket.io.socket.id is a string generated internally by Socket.IO to uniquely identify that particular client connection during its lifetime.























->npm i @monaco-editor/react ->for different code IDE environments 