import { TransactionBlock } from '@mysten/sui.js/transactions';
import { 
  suiClient, 
  CONTRACT_CONFIG, 
  getAdminKeypair, 
  executeTransaction 
} from '../config/sui.js';

class AcademyService {
  
  // Criar novo aluno
  async criarAluno(googleId, nome, faixa) {
    try {
      const txb = new TransactionBlock();
      const adminKeypair = getAdminKeypair();
      const walletAddress = adminKeypair.getPublicKey().toSuiAddress();
      
      txb.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::criar_aluno`,
        arguments: [
          txb.pure.string(googleId),
          txb.pure.string(nome),
          txb.pure.string(faixa),
          txb.pure.address(walletAddress),
          txb.object(CONTRACT_CONFIG.clockId),
        ],
      });
      
      const result = await executeTransaction(txb, adminKeypair);
      
      const alunoId = result.objectChanges?.find(
        obj => obj.type === 'created' && obj.objectType.includes('::academy::Aluno')
      )?.objectId;
      
      return {
        success: true,
        alunoId,
        digest: result.digest,
        events: result.events
      };
      
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  }
  
  // Registrar presença
  async registrarPresenca(alunoId, fotoUrl) {
    try {
      const txb = new TransactionBlock();
      const adminKeypair = getAdminKeypair();
      
      txb.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::registrar_presenca_com_foto`,
        arguments: [
          txb.object(alunoId),
          txb.pure.string(fotoUrl),
          txb.object(CONTRACT_CONFIG.clockId),
        ],
      });
      
      const result = await executeTransaction(txb, adminKeypair);
      
      return {
        success: true,
        digest: result.digest,
        events: result.events
      };
      
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      throw error;
    }
  }
  
  // Atualizar mensalidade (CORRIGIDO)
  async atualizarMensalidade(alunoId, valorCentavos, diasValidade) {
    try {
      const txb = new TransactionBlock();
      const adminKeypair = getAdminKeypair();
      
      txb.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::atualizar_mensalidade`,
        arguments: [
          txb.object(CONTRACT_CONFIG.adminCapId),
          txb.object(alunoId),
          txb.pure.u64(valorCentavos),      // valor em centavos (ex: 15000 = R$ 150,00)
          txb.pure.u64(diasValidade),       // dias de validade (ex: 30)
          txb.object(CONTRACT_CONFIG.clockId),
        ],
      });
      
      const result = await executeTransaction(txb, adminKeypair);
      
      return {
        success: true,
        digest: result.digest
      };
      
    } catch (error) {
      console.error('Erro ao atualizar mensalidade:', error);
      throw error;
    }
  }
  
  // Buscar dados do aluno
  async buscarAluno(alunoId) {
    try {
      const object = await suiClient.getObject({
        id: alunoId,
        options: { showContent: true }
      });
      
      return object.data;
      
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }
  }
  
  // Listar todos os eventos de alunos criados
  async listarAlunos() {
    try {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::AlunoCreated`
        }
      });
      
      return events.data;
      
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  }
}

export default new AcademyService();
