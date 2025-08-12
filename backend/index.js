import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);//Creates an HTTP server that uses your Express app to handle all incoming HTTP requests

const io= new Server(server,{
    cors: {
        origin: 'http://localhost:5173', // Allow all origins for CORS
    }
})

const rooms= new Map(); //new key value pair(roomId,userName)

io.on("connection", (socket)=>{    //listens for a new client connection
    console.log("User connected:", socket.id); 

    let currentRoom = null; //updated when user joins room
    let currentUser = null; //updated when user joins room

    //Events called by the client from socket.io-client

    socket.on("join",({roomId, userName})=>{  //listens for a join event from the client
        if(currentRoom){     //if already in a room
            socket.leave(currentRoom); // Leave the previous room
            rooms.get(currentRoom).delete(currentUser); // Remove user from the previous room
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Notify all users in the previous room about the user leaving
        }

        currentRoom = roomId;   //reflect the new room
        currentUser = userName;

        socket.join(roomId); // Join the new room
        if(!rooms.has(roomId)){
            rooms.set(roomId, new Set()); // Create a new set for the room if it doesn't exist
        }
        rooms.get(roomId).add(userName); // Add user to the room's set
        io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId))) // Notify all users in the room about the new user

        console.log(`User ${userName} joined room ${roomId}`);
        
    })
    socket.on("codeChange", ({roomId, code}) => {
        socket.to(roomId).emit("codeUpdate", code); // Broadcast the code change to all users in the room
    });

    socket.on("leaveRoom", () => {
        if(currentRoom && currentUser) {
            rooms.get(currentRoom).delete(currentUser); // Remove user from the room
            socket.leave(currentRoom); // Leave the room
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Notify all users in the room about the user leaving
            console.log(`User ${currentUser} left room ${currentRoom}`);
            currentRoom = null; // Reset current room
            currentUser = null; // Reset current user
        }
    });

    socket.on("typing", ({roomId, userName}) => {
        socket.to(roomId).emit("userTyping", userName); // Notify other users in the room that someone is typing
    });

    socket.on("languageChange", ({roomId, language}) => {
        io.to(roomId).emit("languageUpdate", language); // Notify other users in the room about the language change
    });
    socket.on("disconnect", ()=>{
        if(currentRoom && currentUser) {
            rooms.get(currentRoom).delete(currentUser); // Remove user from the room
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Notify all users in the room about the user leaving
            console.log(`User ${currentUser} left room ${currentRoom}`);
        }
    })
    
})

const __dirname = path.resolve(); // Get the current directory name
app.use(express.static(path.join(__dirname, '/frontend/dist'))); // Serve static files from the frontend build directory

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "frontend","dist","index.html")); // Serve the index.html file for all routes      
})
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});