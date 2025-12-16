const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./academia.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS alunos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    faixa TEXT NOT NULL,
    foto_url TEXT,
    mensalidade_em_dia BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS presencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id TEXT NOT NULL,
    foto_url TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
  )`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/alunos', upload.single('foto'), async (req, res) => {
  try {
    const { nome, faixa } = req.body;
    console.log('📝 Recebido:', { nome, faixa });

    const alunoId = '0x' + Math.random().toString(16).substr(2, 40);
    console.log('🆔 ID gerado:', alunoId);

    db.run(
      'INSERT INTO alunos (id, nome, faixa, foto_url) VALUES (?, ?, ?, ?)',
      [alunoId, nome, faixa, null],
      function(err) {
        if (err) {
          console.error('❌ Erro:', err);
          return res.status(500).json({ error: err.message });
        }

        console.log('✅ Salvo!');
        
        res.json({
          success: true,
          id: alunoId,
          nome: nome,
          faixa: faixa
        });
      }
    );
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alunos/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, aluno) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

    db.all('SELECT * FROM presencas WHERE aluno_id = ? ORDER BY timestamp DESC', [id], (err, presencas) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...aluno, presencas });
    });
  });
});

app.post('/api/presencas', upload.single('foto'), async (req, res) => {
  try {
    const { alunoId } = req.body;

    db.run(
      'INSERT INTO presencas (aluno_id, foto_url) VALUES (?, ?)',
      [alunoId, null],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, presencaId: this.lastID, alunoId: alunoId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mensalidades', (req, res) => {
  const { alunoId, emDia } = req.body;

  db.run(
    'UPDATE alunos SET mensalidade_em_dia = ? WHERE id = ?',
    [emDia ? 1 : 0, alunoId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, alunoId: alunoId, mensalidade_em_dia: emDia });
    }
  );
});

app.get('/api/alunos', (req, res) => {
  db.all('SELECT * FROM alunos ORDER BY created_at DESC', [], (err, alunos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(alunos);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
