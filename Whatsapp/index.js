const express = require("express");
const qrcode = require('qrcode-terminal');

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo')
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/whatsapp';

const app = express();
const port = 3001;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');


let store;

mongoose.connect(MONGODB_URI).then(()=> {
    store = new MongoStore({ mongoose: mongoose });
    console.log('MongoDB Connected');
    console.log(store);
});


const io = new Server(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

let hitCount = 0;
app.get('/', (req, res) => {
    hitCount = hitCount +1
    console.log('Server hit count : ', hitCount)
    res.send('The Server is Running & Responding')
})


server.listen(port,()=>{
    console.log('Server Listening at :',port)
    console.log('Server is Running');
});

const allSessionObject = {};
const createWhatsappSession = (id, socket) => { 
    const client = new Client({
        puppeteer:{
            headless: false,
        },
        authStrategy : new RemoteAuth({
            clientId: id,
            store: store,
            backupSyncIntervalMs: 300000
        }),
    });

    
    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        console.log('QR Code Created....')
        socket.emit('qr :', qr)
    });
        
    client.on('authenticated', () => {
        console.log('Client authenticated');
    });

    client.on('ready',() => {
        console.log('client is ready');
        allSessionObject[id] = client;
        socket.emit('session-bet-initiate');
        
    });

    client.on('remote_session_saved',()=> {
        console.log('Remote session saved : DB user created')
        socket.emit('remote_session_saved', {
            message: 'Remote Session Saved',
        });
    });
    
    client.initialize();
};


const getWhatsappSession = (id, socket) => {
    const client = new Client({
        puppeteer:{
            headless: false,
        },
        authStrategy : new RemoteAuth({
            clientId: id,
            store: store,
            backupSyncIntervalMs: 300000
        }),
    });

    client.on('ready', ()=> {
        console.log('client is ready');
        socket.emit('ready', {
            id, 
            message: 'Client is ready',
            
        });
    });

    client.on('qr', (qr) => {
        socket.emit('qr', {
            qr,
            message: 'Youre logget out, login again with QR code',
        });
    });

    client.initialize();
};

io.on('connection', (socket) => {
    console.log('User Connected', socket.id);
    socket.on('disconnect', ()=>{
        console.log('User Disconnected')
    });
    socket.on('connected', (data)=> {
        console.log('connected to server',data);
        socket.emit('Server Respond: Hello!!');
    });

    socket.on('createSession', (data) => {
        hitCount = hitCount + 1
        console.log(hitCount);
        console.log(data);
        const { id } = data;
        createWhatsappSession(id, socket)
    });


    socket.on('getSession', (data) => {
        console.log(data);
        const { id } = data;
        getWhatsappSession(id, socket)
    });

    socket.on('getAllChats', async (data)=> {
        console.log('get all chats', data);
        const {id} = data
        const client = allSessionObject[id];
        const allChats = await client.getChats();
        socket.emit('allChats', {
            allChats,
        });
    });
});

