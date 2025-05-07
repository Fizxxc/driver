const express = require('express');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Folder untuk file HTML dan statis lainnya

let driverLocations = {}; // Menyimpan lokasi driver berdasarkan socket.id

// Ketika ada koneksi dari client
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Mendapatkan update lokasi dari driver
  socket.on('driverLocationUpdate', (data) => {
    driverLocations[socket.id] = {
      lat: data.lat,
      lng: data.lng,
      name: data.name || `Driver ${socket.id}`,  // Jika nama kosong, gunakan ID socket
      photo: data.photo || 'https://i.imgur.com/6b6psnA.png' // Default foto profil
    };
    io.emit('updateDriverLocations', driverLocations); // Mengirim update ke semua client
  });

  // Menghapus driver dari daftar saat disconnect
  socket.on('disconnect', () => {
    delete driverLocations[socket.id];
    io.emit('updateDriverLocations', driverLocations); // Kirim update setelah driver disconnect
  });
});

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/driver', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});


// Menjalankan server pada port 3000
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
