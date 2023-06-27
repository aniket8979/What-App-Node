const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

// Session storage variable and file path
const SESSION_FILE_PATH = './session.json';
let sessionData;




// Load the session data if it has been previously saved
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Client to handle event ## It is a variable Not a KeyWord !!!
const client = new Client({
    session: sessionData,
});

// This code handle QR Fetching and Scanning
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    client.getChats().then(chat => {
        console.log(chat[0])
    })
});


client.on('message', message => {
	if(message.body === 'hello') {
		client.sendMessage(message.from, 'hello11');
	}
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.initialize();