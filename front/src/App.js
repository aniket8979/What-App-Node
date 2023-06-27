import React, { useState } from 'react'
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import { useEffect } from 'react';
const socket = io.connect('http://localhost:3001', {});


function App() {
  const [session, setSession] = useState('')
  const [qrCode, setQrCode]= useState(""); 
  const createSessionForWhatsapp = () => {

  socket.emit('createSession',{
    id: session
  });
};
const [id, setId] = useState('');

  useEffect(()=>{
    socket.emit('Hello server, this is client');
    socket.on('qr', (data)=>{
      const {qr} = data;
      console.log("QR: ", qr);
      setQrCode(qr)
    });

    socket.on('ready',(data) => {
      console.log(data);
      const {id} = data;
      setId(id)
    })
    
    socket.on('allChats', (data) =>{
      console.log('all chats', data);
    });
  }, []);


  const getAllChats = () => {
    socket.emit('getAllChats', {id});
  }

  return (
    <div>
      <h1>QR Code to whatsapp web</h1>
      <input type='text'
      value={session}
      onChange={(e) =>{
        setSession(e.target.value);
      }} 
      />
      <button onClick={createSessionForWhatsapp}>Create Session</button>
      <div>
        {id !=="" && <button onClick={getAllChats}>Get Chats</button>}
      </div>
      <QRCode value={qrCode} ></QRCode>  
    </div>


  );
};


export default App