const express = require("express");
const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/Whatsapp'

const app = express();
const port = 3001;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);


server.listen(port,()=>{
    console.log('Server is Running');
});


// let store;
// mongoose.connect(MONGODB_URI).then(()=> {
//     console.log('MongoDB Connected');
//     store = new MongoStore({mongoose:mongoose});
// })


const allSessionObject = {};
const createWhatsappSession = (id, socket) => { 
    const client = new Client({
        puppeteer:{
            headless: false,
        },
        authStrategy : new RemoteAuth({
            clientId: id,
            // store: store,
        }),
    });
    
    client.on('qr', (qr) => {
        // Generate and display QR code
        qrcode.generate(qr, { small: true });
        console.log('QR Code Created....')
        socket.emit('QR :', qr)
    });
        
    client.on('authenticated', () => {
        console.log('Client authenticated');
    });

    client.on('ready',() => {
        console.log('client is ready');
        allSessionObject[id] = client;
        socket.emit('session-bet-initiate');
        // saveSession(sessionId, session);
    });

    client.on('remote_session_saved',()=> {
        console.log('Remote session saved : DB user created')
    });
    
    client.initialize();
};

io.on('Connection', (socket) => {
    console.log('User Connected', socket.id);
    Socket.on('disconnect', ()=>{
        console.log('User Disconnected')
    });
    socket.on('connected', (data)=> {
        console.log('connected to server',data);
        socket.emit('Server Respond: Hello!!');
    });

    socket.on('createSession', (data) => {
        console.log(data);
        const { id } = data;
        createWhatsappSession(id, socket)
    });
});






   






// Function to initialize the client
// async function initializeClient(sessionId) {
//   const session = await loadSession(sessionId);
//   const client = new Client({ session });

//   client.on('qr', (qr) => {
//     // Generate and display QR code
//     qrcode.generate(qr, { small: true });
//     console.log('QR Code Created....')
//   });

//   client.on('authenticated', (session) => {
//     console.log('Client authenticated');
//     allSe
//     saveSession(sessionId, session);
//   });

//   client.on('ready', () => {
//     console.log('Client is ready');
//   });

//   client.on('message', (message) => {
//     console.log('New message:', message.body);
//   });

//   client.initialize();
// }

// // Specify a unique session ID for each user or session
// const sessionId = 'Aniketwhatsapp1';

// // Initialize the client with the provided session ID
// initializeClient('Aniket');
