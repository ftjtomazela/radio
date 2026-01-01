const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Variável para guardar o último áudio (Memória RAM)
let ultimoAudio = [];

io.on('connection', (socket) => {
  const codinome = "Operador " + Math.floor(1000 + Math.random() * 9000);
  console.log(codinome + ' conectado: ' + socket.id);

  socket.emit('set_identity', codinome);

  // --- VOZ ---
  socket.on('start_tx', () => {
    // Começou a falar? Limpa a memória anterior
    ultimoAudio = []; 
    socket.broadcast.emit('remote_start_tx', codinome);
  });

  socket.on('voice_data', (data) => {
    // Guarda o pedacinho na memória
    ultimoAudio.push(data);
    // E manda ao vivo para os outros
    socket.broadcast.emit('play_voice', data);
  });

  socket.on('end_tx', () => {
    socket.broadcast.emit('remote_end_tx');
  });

  // --- REPLAY (NOVO) ---
  socket.on('pedir_replay', () => {
    if (ultimoAudio.length > 0) {
        // Envia todos os pedacinhos de volta para quem pediu
        socket.emit('receber_replay', ultimoAudio);
    }
  });

  // --- CHAT ---
  socket.on('send_text', (msg) => {
    io.emit('receive_text', { user: codinome, text: msg });
  });
});

http.listen(3000, () => {
  console.log('--- SISTEMA TÁTICO COM GRAVAÇÃO ---');
  console.log('Rodando na porta 3000');
});