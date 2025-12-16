import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AlunoPage() {
  const [alunoId, setAlunoId] = useState('');
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarAluno = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/alunos/${alunoId}`);
      const data = await response.json();
      setAluno(data);
    } catch (error) {
      alert('Erro ao buscar aluno: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8">
      <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
        ← Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          👤 Área do Aluno
        </h1>

        {/* Buscar Aluno */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">🔍 Buscar Perfil</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Digite seu ID (ex: 0x123...)"
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="flex-1 px-4 py-2 rounded bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={buscarAluno}
              disabled={loading || !alunoId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded transition"
            >
              {loading ? '⏳' : '🔍'} Buscar
            </button>
          </div>
        </div>

        {/* Dados do Aluno */}
        {aluno && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <div className="flex items-center gap-6 mb-6">
              {aluno.foto_url ? (
                <img 
                  src={aluno.foto_url} 
                  alt={aluno.nome}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
              
              <div>
                <h2 className="text-3xl font-bold">{aluno.nome}</h2>
                <p className="text-gray-300">Faixa: {aluno.faixa}</p>
                <p className="text-sm text-gray-400 mt-2">ID: {aluno.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded p-4">
                <p className="text-gray-400 text-sm">Mensalidade</p>
                <p className={`text-2xl font-bold ${aluno.mensalidade_em_dia ? 'text-green-400' : 'text-red-400'}`}>
                  {aluno.mensalidade_em_dia ? '✅ Em dia' : '❌ Atrasada'}
                </p>
              </div>

              <div className="bg-white/5 rounded p-4">
                <p className="text-gray-400 text-sm">Total de Presenças</p>
                <p className="text-2xl font-bold text-blue-400">
                  {aluno.presencas?.length || 0} aulas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Presenças */}
        {aluno?.presencas && aluno.presencas.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">📅 Histórico de Presenças</h3>
            
            <div className="space-y-2">
              {aluno.presencas.map((presenca, index) => (
                <div key={index} className="bg-white/5 rounded p-3 flex justify-between items-center">
                  <span>📍 Aula #{index + 1}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(presenca.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
