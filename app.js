const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars'); // Importe 'express-handlebars' corretamente
const path = require('path'); // Importe o módulo path
const app = express();
const PORT = 3000;

// Configurar o express-session
app.use(session({
  secret: 'EndyAlves24',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('public'));


app.use(express.urlencoded({extended:false}))
app.use(express.json())


  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Vags_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexão com o MongoDB estabelecida'))
  .catch((err) => console.error('Erro ao conectar com o MongoDB:', err));

// Definir o esquema do usuário
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Rota para a página de registro de usuário
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });
  try {
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.send('Erro ao registrar o usuário.');
  }
});

// Rota para lidar com o registro de usuário
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.redirect('/login');
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.render(`login`);
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      // Armazene o nome de usuário na sessão
      req.session.username = username;
      res.redirect(`/landing`);
    } else {
      res.send('Credenciais inválidas. Por favor, tente novamente.');
    }
  } catch (error) {
    res.send('Erro ao fazer login.');
  }
});

// Rota para lidar com a autenticação de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  res.redirect('landing')
});

app.get('/landing', (req, res) => {
  // Acesse o nome de usuário armazenado na sessão
  const username = req.session.username || "User";

  res.render('landingPage', {user: {username}});
})


//porta em que o site vai rodar
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});