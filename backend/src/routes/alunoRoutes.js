import express from 'express';
import academyService from '../services/academyService.js';

const router = express.Router();

// Criar novo aluno
router.post('/', async (req, res) => {
  try {
    const { googleId, nome, faixa } = req.body;
    
    if (!googleId || !nome || !faixa) {
      return res.status(400).json({ 
        error: 'googleId, nome e faixa são obrigatórios' 
      });
    }
    
    const result = await academyService.criarAluno(googleId, nome, faixa);
    
    res.json({
      message: 'Aluno criado com sucesso!',
      data: result
    });
    
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ 
      error: 'Erro ao criar aluno',
      details: error.message 
    });
  }
});

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const alunos = await academyService.listarAlunos();
    res.json({
      data: alunos,
      total: alunos.length
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ 
      error: 'Erro ao listar alunos',
      details: error.message 
    });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aluno = await academyService.buscarAluno(id);
    res.json({ data: aluno });
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar aluno',
      details: error.message 
    });
  }
});

export default router;
