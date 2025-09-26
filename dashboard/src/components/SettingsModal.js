import React, { useState } from 'react';
import { X, GitBranch, Trash2, AlertTriangle, Settings, ChevronDown } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, repositories, onRepositoryDelete, selectedRepository, onRepositoryChange }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [repositoryToDelete, setRepositoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (repo) => {
    setRepositoryToDelete(repo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!repositoryToDelete) return;
    
    setIsDeleting(true);
    try {
      await onRepositoryDelete(repositoryToDelete.id);
      setShowDeleteModal(false);
      setRepositoryToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar repositório:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRepositoryToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal de Configurações */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Seção de Seleção de Repositório */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Selecionar Repositório
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repositório Ativo
                </label>
                <div className="relative">
                  <select
                    value={selectedRepository || ''}
                    onChange={(e) => onRepositoryChange(e.target.value || null)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os repositórios</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {repositories.length === 0 && (
                  <div className="mt-3 text-sm text-gray-500 flex items-center">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Nenhum repositório encontrado. Configure um webhook para começar.
                  </div>
                )}
              </div>
            </div>

            {/* Seção de Gerenciamento de Repositórios */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Gerenciar Repositórios
              </h3>
              
              {repositories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum repositório encontrado.</p>
                  <p className="text-sm">Configure um webhook para começar a receber eventos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center flex-1">
                        <GitBranch className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{repo.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {repo.private ? 'Privado' : 'Público'} • 
                            Criado em {new Date(repo.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(repo)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover repositório e todos os seus dados"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção de Informações */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Total de Repositórios</p>
                  <p className="text-blue-700">{repositories.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Status da API</p>
                  <p className="text-green-700">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && repositoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>
            
            <div className="text-gray-600 mb-6">
              <p>
                Tem certeza que deseja remover o repositório <strong>{repositoryToDelete.full_name}</strong>?
              </p>
              <br />
              <p className="text-red-600 font-medium">
                Esta ação irá remover permanentemente:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>O repositório</li>
                <li>Todos os eventos associados</li>
                <li>Todos os dados históricos</li>
              </ul>
              <br />
              <p className="text-red-600 font-medium">Esta ação não pode ser desfeita!</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
