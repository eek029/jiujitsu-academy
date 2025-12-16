import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da rede
const network = process.env.SUI_NETWORK || 'testnet';
const rpcUrl = getFullnodeUrl(network);

// Cliente Sui
export const suiClient = new SuiClient({ url: rpcUrl });

// IDs do contrato
export const CONTRACT_CONFIG = {
  packageId: process.env.PACKAGE_ID,
  adminCapId: process.env.ADMIN_CAP_ID,
  clockId: process.env.CLOCK_ID || '0x6',
  moduleName: 'academy'
};

// Endereço do admin (primeira chave - awesome-moonstone)
const ADMIN_ADDRESS = '0x7ef135b499a13ecc6a77107049d9334979180f6e5ae1f7f4a7aaebdc905f9def';

// Ler keypair do arquivo de configuração do Sui CLI
export function getAdminKeypair() {
  try {
    const keystorePath = join(homedir(), '.sui', 'sui_config', 'sui.keystore');
    const keystore = JSON.parse(readFileSync(keystorePath, 'utf8'));
    
    // Pegar a primeira chave (Ed25519)
    const privateKeyBase64 = keystore[0];
    
    // Decodificar Base64 e criar keypair
    const privateKeyBytes = Uint8Array.from(Buffer.from(privateKeyBase64, 'base64'));
    
    // Remover o flag byte (primeiro byte) se necessário
    const secretKey = privateKeyBytes.length === 33 ? privateKeyBytes.slice(1) : privateKeyBytes;
    
    return Ed25519Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Erro ao carregar keypair:', error);
    throw new Error('Não foi possível carregar a chave do keystore do Sui CLI');
  }
}

// Função auxiliar para executar transações
export async function executeTransaction(txb, signer) {
  try {
    const result = await suiClient.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao executar transação:', error);
    throw error;
  }
}

export { TransactionBlock };
