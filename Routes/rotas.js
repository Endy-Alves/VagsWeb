const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router(); // Usando o mesmo router
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('../app'); // Importe o modelo User
const upload = multer({ dest: 'public/uploads/' }); // Define o diretório onde as imagens serão armazenadas
const Message = require('../app');


// Endpoint para enviar uma mensagem
router.post('/sendMessage', async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    await newMessage.save();

    res.status(201).json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Endpoint para recuperar mensagens em uma conversa
router.get('/getMessages/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort('timestamp');

    res.json(messages);
  } catch (error) {
    console.error('Erro ao recuperar mensagens:', error);
    res.status(500).json({ error: 'Erro ao recuperar mensagens' });
  }
});



// Configuração do armazenamento de arquivos com o multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//const upload = multer({ storage: storage });

// Rota de upload
  router.post('/upload', upload.single('profileImage'), async (req, res) => {
    // Encontre o usuário correspondente pelo nome de usuário da sessão
    const user = await User.findOne({ username: req.session.username });
  
    if (user) {
      // Atualize o campo profileImage do usuário
      user.profileImage = req.file.filename;
      await user.save();
    }
  
    res.redirect('/landing'); // Redirecione para a página de destino
  });
  

// Rota para a página de registro de usuário
router.get('/register', (req, res) => {
    res.render('register');
  });
  router.post('/register', upload.single('profileImage'), async (req, res) => {
    const { username, password } = req.body;
    const profileImage = req.file ? req.file.filename : ''; // Verifica se uma imagem foi carregada
  
    try {
      // Crie um novo usuário com os dados do registro
      const newUser = new User({ username, password, profileImage });
      await newUser.save();
  
      req.session.username = username;
      res.redirect('/login');
    } catch (error) {
      res.send('Erro ao registrar o usuário.');
    }
  });
  
  // Rota para lidar com o registro de usuário
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });
    res.redirect('/login');
  });
  
  // Rota para a página de login
  router.get('/login', (req, res) => {
    res.render(`login`);
  });
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username, password });
      if (user) {
        // Armazene o nome de usuário na sessão
        req.session.username = username;
        // Armazene a imagem de perfil na sessão
        req.session.profileImage = user.profileImage;
        res.redirect(`/landing`);
      } else {
        res.send('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (error) {
      res.send('Erro ao fazer login.');
    }
  });
  
  // Rota para lidar com a autenticação de login
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    res.redirect('landing')
  });


// Rota da página principal
router.get('/landing', async (req, res) => {
  try {
    // Busque a lista de usuários no banco de dados
    const users = await User.find({}, 'username profileImage'); // Inclua 'profileImage' para buscar a imagem de perfil dos usuários
    const username = req.session.username || "User";
    const profileImage = req.session.profileImage || "default.jpg"; // Defina uma imagem padrão caso não haja imagem de perfil
  
    res.render('landingPage', { users, user: { username }, profileImage }); // Passe profileImage como uma variável local
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).send('Erro ao buscar usuários.');
  }
});


// Rota para iniciar uma conversa com um usuário específico
router.get('/chat/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    // Busque o usuário correspondente ao userId no banco de dados
    const otherUser = await User.findById(userId, 'username');
    
    if (!otherUser) {
      // Se o usuário não for encontrado, você pode lidar com isso da maneira que preferir, por exemplo, exibindo uma mensagem de erro.
      return res.status(404).send('Usuário não encontrado');
    }

    // Renderize a página de chat para o usuário com o ID fornecido e passe otherUser como variável local
    res.render('chat', { otherUser });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).send('Erro ao buscar usuário.');
  }
});


  // Rota para iniciar uma conversa com um usuário específico
router.get('/chat/:userId', (req, res) => {
  const userId = req.params.userId;
  // Renderize a página de chat para o usuário com o ID fornecido
  res.render('chat', { userId });
});


module.exports = router;
