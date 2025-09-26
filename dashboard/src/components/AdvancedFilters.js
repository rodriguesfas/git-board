import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Calendar, User, GitBranch, X, Search } from 'lucide-react';

const AdvancedFilters = ({ 
  events = [], 
  repositories = [], 
  onFiltersChange, 
  isOpen, 
  onToggle 
}) => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    authors: [],
    eventTypes: [],
    repositories: [],
    branches: [],
    searchTerm: ''
  });

  const [availableOptions, setAvailableOptions] = useState({
    authors: [],
    eventTypes: [],
    branches: []
  });

  // Extrair opções disponíveis dos eventos
  useEffect(() => {
    if (events.length === 0) return;

    const authors = [...new Set(events.map(e => e.actor_login).filter(Boolean))];
    const eventTypes = [...new Set(events.map(e => e.event_type).filter(Boolean))];
    const branches = [...new Set(events.map(e => e.branch).filter(Boolean))];

    setAvailableOptions({
      authors: authors.sort(),
      eventTypes: eventTypes.sort(),
      branches: branches.sort()
    });
  }, [events]);

  // Memoizar a função onFiltersChange para evitar loops infinitos
  const memoizedOnFiltersChange = useCallback(onFiltersChange, []);
  
  // Aplicar filtros quando mudarem
  useEffect(() => {
    memoizedOnFiltersChange(filters);
  }, [filters, memoizedOnFiltersChange]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.filters-dropdown')) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterChange = (filterType, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      authors: [],
      eventTypes: [],
      repositories: [],
      branches: [],
      searchTerm: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.authors.length > 0) count++;
    if (filters.eventTypes.length > 0) count++;
    if (filters.repositories.length > 0) count++;
    if (filters.branches.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  if (!isOpen) {
    return (
      <div className="filters-dropdown">
        <button
          onClick={onToggle}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
        {getActiveFiltersCount() > 0 && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getActiveFiltersCount()}
          </span>
        )}
        </button>
      </div>
    );
  }

  return (
    <div className="filters-dropdown">
      <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header do dropdown */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Limpar
            </button>
            <button
              onClick={onToggle}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do dropdown */}
      <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
        {/* Busca por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar em títulos, descrições..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Período
          </label>
          <div className="space-y-2">
            <input
              type="date"
              placeholder="Data inicial"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters.dateRange,
                start: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              placeholder="Data final"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters.dateRange,
                end: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filtro por repositórios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GitBranch className="w-4 h-4 inline mr-1" />
            Repositórios
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {repositories.map((repo) => (
              <label key={repo.id} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.repositories.includes(repo.id)}
                  onChange={(e) => handleArrayFilterChange('repositories', repo.id, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{repo.full_name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por autores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Autores
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableOptions.authors.map((author) => (
              <label key={author} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.authors.includes(author)}
                  onChange={(e) => handleArrayFilterChange('authors', author, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{author}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por tipos de evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Evento
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableOptions.eventTypes.map((eventType) => (
              <label key={eventType} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.eventTypes.includes(eventType)}
                  onChange={(e) => handleArrayFilterChange('eventTypes', eventType, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{eventType}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por branches */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branches
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableOptions.branches.map((branch) => (
              <label key={branch} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.branches.includes(branch)}
                  onChange={(e) => handleArrayFilterChange('branches', branch, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{branch}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo dos filtros ativos */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros Ativos:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.dateRange.start && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Desde: {new Date(filters.dateRange.start).toLocaleDateString('pt-BR')}
              </span>
            )}
            {filters.dateRange.end && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Até: {new Date(filters.dateRange.end).toLocaleDateString('pt-BR')}
              </span>
            )}
            {filters.authors.map(author => (
              <span key={author} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {author}
              </span>
            ))}
            {filters.eventTypes.map(eventType => (
              <span key={eventType} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {eventType}
              </span>
            ))}
            {filters.branches.map(branch => (
              <span key={branch} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {branch}
              </span>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
