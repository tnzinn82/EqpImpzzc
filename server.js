const express = require('express');
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Armazenamento dos uploads em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cria diretório temporário pra salvar imagens
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Página inicial com formulário invisível
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>EQP IMP - UPLOAD</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
        color: white;
        font-family: Arial, sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: fadeIn 2s ease-in-out;
      }
      h1 {
        font-size: 2.5rem;
        color: #0ff;
        text-shadow: 0 0 20px #0ff;
      }
      form {
        margin-top: 20px;
      }
      input[type="file"] {
        display: none;
      }
      label {
        background-color: #0ff;
        color: #000;
        padding: 10px 20px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        animation: pulse 2s infinite;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    </style>
  </head>
  <body>
    <h1>EQP IMP - UPLOAD</h1>
    <form id="form" enctype="multipart/form-data" method="POST" action="/upload">
      <label for="file">ENVIAR FOTO</label>
      <input type="file" id="file" name="image" onchange="document.getElementById('form').submit()">
    </form>

    <script>
      document.querySelector('label').addEventListener('click', () => {
        document.getElementById('file').click();
      });
    </script>
  </body>
  </html>
  `);
});

// Rota que salva a imagem e redireciona
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhuma imagem enviada');

  const ext = mime.extension(req.file.mimetype) || 'jpg';
  const fileName = `img_${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, req.file.buffer);

  res.redirect(`/upload?file=${fileName}`);
});

// Rota de exibição do link + botão de download
app.get('/upload', (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).send('Arquivo não encontrado');

  const fileUrl = `/img/${file}`;
  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Arquivo Enviado</title>
    <style>
      body {
        background: #121212;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding-top: 100px;
        animation: slideDown 1.5s ease;
      }
      a {
        display: inline-block;
        margin-top: 20px;
        padding: 15px 30px;
        border-radius: 10px;
        background: linear-gradient(45deg, #ff0066, #00ccff, #00ff99);
        background-size: 300% 300%;
        color: white;
        font-weight: bold;
        text-decoration: none;
        animation: changeColors 5s infinite;
      }
      input {
        margin-top: 20px;
        width: 90%;
        max-width: 300px;
        padding: 10px;
        border-radius: 5px;
        border: none;
      }
      @keyframes slideDown {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes changeColors {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    </style>
  </head>
  <body>
    <h2>Link da sua imagem:</h2>
    <input readonly value="${fileUrl}" onclick="this.select()"><br>
    <a href="${fileUrl}" download onclick="startDownload(this)">Baixar Imagem</a>

    <script>
      function startDownload(el) {
        el.innerText = "Iniciando download...";
        setTimeout(() => {
          el.innerText = "Baixar Imagem";
        }, 3000);
      }
    </script>
  </body>
  </html>
  `);
});

// Servir os arquivos da pasta uploads
app.use('/img', express.static(uploadsDir));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔥 EQP IMP rodando em http://localhost:${PORT}`);
});