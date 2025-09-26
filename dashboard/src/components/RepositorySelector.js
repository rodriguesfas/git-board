import React from 'react';
import { ChevronDown, GitBranch } from 'lucide-react';

const RepositorySelector = ({ repositories, selectedRepository, onRepositoryChange, loading }) => {
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
    </div>
  );
};

export default RepositorySelector;
