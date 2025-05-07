const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let messages = [];
let adminOnline = true;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/admin-inbox', (req, res) => {
  res.render('admin', { messages });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('admin status', adminOnline);

  socket.on('chat message', (msg) => {
    messages.push({ from: 'user', text: msg });
    io.emit('chat message', { from: 'user', text: msg });
  });

  socket.on('admin reply', (msg) => {
    messages.push({ from: 'admin', text: msg });
    io.emit('chat message', { from: 'admin', text: msg });
  });

  socket.on('admin status', (status) => {
    adminOnline = status;
    io.emit('admin status', adminOnline);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app; // Penting untuk Vercel
