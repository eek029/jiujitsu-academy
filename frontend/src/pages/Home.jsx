import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          🥋 Academia de Jiu-Jitsu
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Sistema de gestão on-chain com Sui + Walrus
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            to="/aluno" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            👤 Área do Aluno
          </Link>
          
          <Link 
            to="/admin" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            👨‍💼 Área Admin
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-2">⛓️</div>
            <h3 className="font-bold mb-2">On-Chain</h3>
            <p className="text-sm text-gray-300">
              Dados imutáveis na blockchain Sui
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-2">📸</div>
            <h3 className="font-bold mb-2">Walrus Storage</h3>
            <p className="text-sm text-gray-300">
              Fotos armazenadas de forma descentralizada
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold mb-2">Presença Digital</h3>
            <p className="text-sm text-gray-300">
              Registro automático com reconhecimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
