import academyService from '../services/academyService.js';

class AlunoController {
  
  // POST /api/alunos - Criar novo aluno
  async criar(req, res) {
    try {
      const { googleId, nome, faixa } = req.body;
      
      // Validação
      if (!googleId || !nome || !faixa) {
        return res.status(400).json({
          error: 'Campos obrigatórios: googleId, nome, faixa'
        });
      }
      
      const faixasValidas = ['branca', 'azul', 'roxa', 'marrom', 'preta'];
      if (!faixasValidas.includes(faixa.toLowerCase())) {
        return res.status(400).json({
          error: 'Faixa inválida. Use: branca, azul, roxa, marrom ou preta'
        });
      }
      
      const result = await academyService.criarAluno(googleId, nome, faixa);
      
      res.status(201).json({
        message: 'Aluno criado com sucesso!',
        data: result
      });
      
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({
        error: 'Erro ao criar aluno',
        details: error.message
      });
    }
  }
  
  // POST /api/alunos/:id/presenca - Registrar presença
  async registrarPresenca(req, res) {
    try {
      const { id } = req.params;
      const { fotoUrl } = req.body;
      
      if (!fotoUrl) {
        return res.status(400).json({
          error: 'Campo obrigatório: fotoUrl'
        });
      }
      
      const result = await academyService.registrarPresenca(id, fotoUrl);
      
      res.json({
        message: 'Presença registrada com sucesso!',
        data: result
      });
      
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({
        error: 'Erro ao registrar presença',
        details: error.message
      });
    }
  }
  
  // PUT /api/alunos/:id/mensalidade - Atualizar mensalidade
  async atualizarMensalidade(req, res) {
    try {
      const { id } = req.params;
      const { pago } = req.body;
      
      if (typeof pago !== 'boolean') {
        return res.status(400).json({
          error: 'Campo obrigatório: pago (boolean)'
        });
      }
      
      const result = await academyService.atualizarMensalidade(id, pago);
      
      res.json({
        message: 'Mensalidade atualizada com sucesso!',
        data: result
      });
      
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({
        error: 'Erro ao atualizar mensalidade',
        details: error.message
      });
    }
  }
  
  // GET /api/alunos/:id - Buscar aluno
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const aluno = await academyService.buscarAluno(id);
      
      res.json({
        data: aluno
      });
      
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({
        error: 'Erro ao buscar aluno',
        details: error.message
      });
    }
  }
  
  // GET /api/alunos - Listar todos os alunos
  async listar(req, res) {
    try {
      const alunos = await academyService.listarAlunos();
      
      res.json({
        data: alunos,
        total: alunos.length
      });
      
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(500).json({
        error: 'Erro ao listar alunos',
        details: error.message
      });
    }
  }
}

export default new AlunoController();
