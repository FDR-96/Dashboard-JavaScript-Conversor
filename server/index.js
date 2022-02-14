const path = require('path');
const express = require('express');
const http = require('http');


const app = express();
const server = http.createServer(app);
//const io = require('socket.io')(somePort);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
  },
});

// settings

// routes


app.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.html');
});

console.log(__dirname);
// static files
app.use(express.static(path.join(__dirname, 'public')));

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

const mySerial = new SerialPort('COM5', {
  baudRate: 9600
});

mySerial.pipe(parser);

//mySerial.write()

mySerial.on('open', function () {
  console.log('Opened Port.');
});

let indice = 0;
let key = ['$', '%', '&', '@', '*'];
let vrms, vred, ms, setPoint, angulo;
let estado = "o";


mySerial.on('data', function (data) {

  var datos = data.toString();
  for(i=0; i<= 5; i++){
      indice = datos.indexOf(key[i]);
      switch(key[i]){
        case  '$':
          vrms = datos.substring(indice + 1, indice + 4);
        break;
        case  '%':
          vred = datos.substring(indice + 1, indice + 4);
        break;
        case  '&':
          ms = datos.substring(indice + 1, indice + 4);
        break;
        case  '@':
          setPoint = datos.substring(indice + 1, indice + 4);
        break;
        case  '*':
          angulo = datos.substring(indice + 1, indice + 4);
        break;
        
      }
  }

      console.log(vrms);
      console.log(vred);
      console.log(ms);
      console.log(setPoint);
      console.log(angulo);
  io.emit('arduino:data', {
      valueRms: vrms,
      valueRed: vred,
      valueMs: ms,
      valueSetPoint: setPoint,
      valueAngulo: angulo
  });   
});

mySerial.on('err', function (data) {
  console.log(err.message);
});


server.listen(8080, () => {
  console.log('Server on port 8080');
});

/* io.on('connection', (socket) => {
  
  socket.on('Encender Apagar', (OnOff) => {
    if(OnOff)return;
    socket.onOff = OnOff;
    console.log(OnOff);
  });
  socket.on('new_message', function (data) {
    socket.broadcast.emit('new_message', data);
    console.log(socket.onOff+' just sent '+data);
    });
    socket.on('disconnect', () => {
      --numUsers;
      console.log(socket.username+' has left, now there are '+numUsers+' online');
});

}); */