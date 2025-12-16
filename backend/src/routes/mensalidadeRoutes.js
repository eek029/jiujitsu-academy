import express from 'express';
import academyService from '../services/academyService.js';

const router = express.Router();

// Atualizar mensalidade
router.put('/', async (req, res) => {
  try {
    const { alunoId, valorCentavos, diasValidade } = req.body;
    
    if (!alunoId || !valorCentavos || !diasValidade) {
      return res.status(400).json({ 
        error: 'alunoId, valorCentavos e diasValidade são obrigatórios',
        exemplo: {
          alunoId: '0x...',
          valorCentavos: 15000,  // R$ 150,00
          diasValidade: 30        // 30 dias
        }
      });
    }
    
    const result = await academyService.atualizarMensalidade(
      alunoId, 
      valorCentavos, 
      diasValidade
    );
    
    res.json({
      message: 'Mensalidade atualizada com sucesso!',
      data: result
    });
    
  } catch (error) {
    console.error('Erro ao atualizar mensalidade:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar mensalidade',
      details: error.message 
    });
  }
});

export default router;
