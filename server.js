const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Aponta para a pasta onde estará o HTML
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Operador conectado: ' + socket.id);

  // Recebe voz e repassa para todos
  socket.on('voice_data', (data) => {
    socket.broadcast.emit('play_voice', data);
  });

  // Sinais visuais (Luz vermelha e Chiado)
  socket.on('start_tx', () => socket.broadcast.emit('remote_start_tx'));
  socket.on('end_tx', () => socket.broadcast.emit('remote_end_tx'));
});

// O servidor roda na porta 3000
http.listen(3000, () => {
  console.log('--------------------------------------');
  console.log('RÁDIO LIGADO NA PORTA 3000');
  console.log('Agora execute o Ngrok para gerar o link!');
  console.log('--------------------------------------');
});