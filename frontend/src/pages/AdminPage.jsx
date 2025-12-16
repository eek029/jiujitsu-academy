import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('cadastrar');
  const [loading, setLoading] = useState(false);
  
  const [novoAluno, setNovoAluno] = useState({
    nome: '',
    faixa: 'branca',
    foto: null
  });

  const [presenca, setPresenca] = useState({
    alunoId: '',
    foto: null
  });

  const [mensalidade, setMensalidade] = useState({
    alunoId: '',
    emDia: true
  });

  const cadastrarAluno = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('nome', novoAluno.nome);
      formData.append('faixa', novoAluno.faixa);
      if (novoAluno.foto) {
        formData.append('foto', novoAluno.foto);
      }

      console.log('📤 Enviando:', novoAluno.nome);

      const response = await fetch('http://localhost:3000/api/alunos', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      if (data.id) {
        alert(`✅ Aluno cadastrado!\n\nID: ${data.id}\n\n⚠️ COPIE ESTE ID!`);
        setNovoAluno({ nome: '', faixa: 'branca', foto: null });
      } else {
        alert('⚠️ ID não retornado!');
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
    
    setLoading(false);
  };

  const registrarPresenca = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('alunoId', presenca.alunoId);
      if (presenca.foto) {
        formData.append('foto', presenca.foto);
      }

      const response = await fetch('http://localhost:3000/api/presencas', {
        method: 'POST',
        body: formData,
      });

      await response.json();
      alert('✅ Presença registrada!');
      setPresenca({ alunoId: '', foto: null });
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
    
    setLoading(false);
  };

  const atualizarMensalidade = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/mensalidades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: mensalidade.alunoId,
          emDia: mensalidade.emDia
        }),
      });

      await response.json();
      alert('✅ Mensalidade atualizada!');
      setMensalidade({ alunoId: '', emDia: true });
    } catch (error) {
      alert('❌ Erro: ' + error.message);
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
          👨‍💼 Painel Admin
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('cadastrar')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition ${
              activeTab === 'cadastrar'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ➕ Cadastrar Aluno
          </button>
          
          <button
            onClick={() => setActiveTab('presenca')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition ${
              activeTab === 'presenca'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ✅ Registrar Presença
          </button>
          
          <button
            onClick={() => setActiveTab('mensalidade')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition ${
              activeTab === 'mensalidade'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            💰 Mensalidade
          </button>
        </div>

        {activeTab === 'cadastrar' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">➕ Cadastrar Novo Aluno</h2>
            
            <form onSubmit={cadastrarAluno} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoAluno.nome}
                  onChange={(e) => setNovoAluno({...novoAluno, nome: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Faixa</label>
                <select
                  value={novoAluno.faixa}
                  onChange={(e) => setNovoAluno({...novoAluno, faixa: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-blue-500"
                >
                  <option value="branca">⚪ Branca</option>
                  <option value="azul">🔵 Azul</option>
                  <option value="roxa">🟣 Roxa</option>
                  <option value="marrom">🟤 Marrom</option>
                  <option value="preta">⚫ Preta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Foto (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNovoAluno({...novoAluno, foto: e.target.files[0]})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
              >
                {loading ? '⏳ Cadastrando...' : '✅ Cadastrar Aluno'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'presenca' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">✅ Registrar Presença</h2>
            
            <form onSubmit={registrarPresenca} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">ID do Aluno</label>
                <input
                  type="text"
                  required
                  value={presenca.alunoId}
                  onChange={(e) => setPresenca({...presenca, alunoId: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-green-500"
                  placeholder="0x123..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Foto da Aula (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPresenca({...presenca, foto: e.target.files[0]})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
              >
                {loading ? '⏳ Registrando...' : '✅ Registrar Presença'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'mensalidade' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">💰 Atualizar Mensalidade</h2>
            
            <form onSubmit={atualizarMensalidade} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">ID do Aluno</label>
                <input
                  type="text"
                  required
                  value={mensalidade.alunoId}
                  onChange={(e) => setMensalidade({...mensalidade, alunoId: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-purple-500"
                  placeholder="0x123..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Status</label>
                <select
                  value={mensalidade.emDia}
                  onChange={(e) => setMensalidade({...mensalidade, emDia: e.target.value === 'true'})}
                  className="w-full px-4 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:border-purple-500"
                >
                  <option value="true">✅ Em dia</option>
                  <option value="false">❌ Atrasada</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
              >
                {loading ? '⏳ Atualizando...' : '💰 Atualizar Mensalidade'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
