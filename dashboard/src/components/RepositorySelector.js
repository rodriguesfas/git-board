import React, { useState } from 'react';
import { ChevronDown, GitBranch, Trash2, AlertTriangle } from 'lucide-react';

const RepositorySelector = ({ repositories, selectedRepository, onRepositoryChange, onRepositoryDelete, loading }) => {
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repositório
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

        {repositories.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Gerenciar Repositórios</h3>
            <div className="space-y-2">
              {repositories.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <GitBranch className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{repo.full_name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(repo)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Remover repositório e todos os seus dados"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showDeleteModal && repositoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover o repositório <strong>{repositoryToDelete.full_name}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                Esta ação irá remover permanentemente:
              </span>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>O repositório</li>
                <li>Todos os eventos associados</li>
                <li>Todos os dados históricos</li>
              </ul>
              <br />
              <span className="text-red-600 font-medium">Esta ação não pode ser desfeita!</span>
            </p>
            
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

export default RepositorySelector;
