const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars'); // Importe 'express-handlebars' corretamente
const path = require('path'); // Importe o módulo path
const multer = require('multer'); // Para lidar com uploads de arquivos
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const PORT = 3000;
const server = http.createServer(app);
const io = socketIo(server);

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

let socket = []

// Lógica de conexão WebSocket
io.on('connection', (socket) => {
  console.log('Um usuário se conectou');

  // Lógica para lidar com mensagens recebidas
  socket.on('sendMessage', (data) => {
    console.log('Mensagem recebida:', data);

    // Emita a mensagem para todos os clientes conectados, incluindo o remetente
    io.emit('message', data);
  });

  // Lógica de desconexão
  socket.on('disconnect', () => {
    console.log('Um usuário se desconectou');
  });
});


const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

// Definir o esquema do usuário
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String // Novo campo para armazenar o caminho da imagem
}, {strict:false});

const User = mongoose.model('User', userSchema);
module.exports = User; // Exporte o modelo User

console.log(User.username)

// Configurar o express-session
app.use(session({
  secret: 'EndyAlves24',
  resave: false,
  saveUninitialized: true
  }));

  app.use(express.static('public'));


app.use(express.urlencoded({extended:false}))
app.use(express.json())

// Importe as rotas
const indexRouter = require('./Routes/rotas');
// Use as rotas
app.use('/', indexRouter);

// Configurar o express-session
app.use(session({
secret: 'EndyAlves24',
resave: false,
saveUninitialized: true
}));


app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://alvesandy32:CRzCO8Cs8LoI8fXM@clustervagsweb.6s0ekwj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterVagsWeb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexão com o MongoDB estabelecida'))
  .catch((err) => console.error('Erro ao conectar com o MongoDB:', err));


  server.listen(4000, () => {
    console.log('Servidor WebSocket está ouvindo na porta 4000');
  });

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
