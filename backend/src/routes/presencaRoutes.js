import express from 'express';
import academyService from '../services/academyService.js';

const router = express.Router();

// Registrar presença
router.post('/', async (req, res) => {
  try {
    const { alunoId, fotoUrl } = req.body;
    
    if (!alunoId || !fotoUrl) {
      return res.status(400).json({ 
        error: 'alunoId e fotoUrl são obrigatórios' 
      });
    }
    
    const result = await academyService.registrarPresenca(alunoId, fotoUrl);
    
    res.json({
      message: 'Presença registrada com sucesso!',
      data: result
    });
    
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    res.status(500).json({ 
      error: 'Erro ao registrar presença',
      details: error.message 
    });
  }
});

export default router;
