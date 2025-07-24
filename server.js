const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar pasta de uploads
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Página inicial
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>EQP IMP - UPLOAD</title>
        <style>
          body {
            background: black;
            color: white;
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
          }
          h1 {
            font-size: 2rem;
            color: #0ff;
            text-shadow: 0 0 15px #0ff;
          }
          input[type="file"] {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>EQP IMP - UPLOAD</h1>
        <form id="uploadForm" enctype="multipart/form-data" method="POST" action="/upload">
          <input type="file" name="file" id="fileInput" required />
        </form>
        <script>
          const fileInput = document.getElementById('fileInput');
          fileInput.addEventListener('change', () => {
            document.getElementById('uploadForm').submit();
          });
        </script>
      </body>
    </html>
  `);
});

// Rota de upload
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  const downloadLink = `${req.protocol}://${req.get('host')}${filePath}`;
  res.send(`
    <html>
      <head>
        <title>Arquivo enviado</title>
        <style>
          body {
            background: #111;
            color: white;
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            animation: fadeIn 1s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          a#download {
            background: linear-gradient(45deg, #00f, #0ff);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-decoration: none;
            animation: pulse 1s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 10px #0ff; }
            50% { box-shadow: 0 0 30px #00f; }
            100% { box-shadow: 0 0 10px #0ff; }
          }
          input {
            width: 100%;
            padding: 10px;
            text-align: center;
            border-radius: 8px;
            border: none;
            background: #222;
            color: white;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <h2>Arquivo Enviado!</h2>
        <input value="${downloadLink}" readonly onclick="this.select()" />
        <a id="download" href="${filePath}" download>Baixar Arquivo</a>
      </body>
    </html>
  `);
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
