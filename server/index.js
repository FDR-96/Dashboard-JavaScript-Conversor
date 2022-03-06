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
const { on } = require('events');
const e = require('express');
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
let key = ['$', '%', '&', '@', '*', 'o', 'x'];
let vrms, vred, ms, setPoint, angulo, onOff;
let estado = "o";

var delayInMilliseconds = 5; //1/2 second

io.on('connection', function(socket) {
  socket.on('event', function(data) {   
      estado = data.message;
      mySerial.write(estado);
      console.log('El cliente envio un mensaje por puerto serial:', data.message);
  });

  socket.on('setPoint', function(data) {   
    let setPoint = data.valor;
    mySerial.write("¡");
    setTimeout(function() {
        mySerial.write(setPoint);
    }, delayInMilliseconds);
    console.log('El cliente envio un mensaje por puerto serial:', data.valor);
  });

});


mySerial.on('data', function (data) {

  var datos = data.toString();
  for(i=0; i<= 6; i++){
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
        case  '+':
          onOff = 1;
        break;
        case  '-':
          onOff = 0;
        break;
        
      }
  }
 // console.log(datos);

/*       console.log(vrms);
      console.log(vred);
      console.log(ms);
      console.log(setPoint);
      console.log(angulo); */
  io.emit('arduino:data', {
      valueRms: vrms,
      valueRed: vred,
      valueMs: ms,
      valueSetPoint: setPoint,
      valueAngulo: angulo,
      valueOnOff: onOff
  });   
});

mySerial.on('err', function (data) {
  console.log(err.message);
});


server.listen(8080, () => {
  console.log('Server on port 8080');
});