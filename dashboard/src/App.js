import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings, Github } from 'lucide-react';
import Timeline from './components/Timeline';
import StatsCards from './components/StatsCards';
import UserStats from './components/UserStats';
import EventTypeChart from './components/EventTypeChart';
import SettingsModal from './components/SettingsModal';
import { useTimeline, useStats, useUserStats, useEventStats, useRepositories } from './hooks/useApi';
import Tooltip, { useTooltips } from './components/Tooltip';
import { apiService } from './services/api';

function App() {
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const tooltips = useTooltips();

  // Hooks para buscar dados
  const { repositories, loading: reposLoading, refetch: refetchRepos } = useRepositories();
  const { timeline, loading: timelineLoading, refetch: refetchTimeline } = useTimeline(selectedRepository);
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(selectedRepository);
  const { userStats, loading: userStatsLoading, refetch: refetchUserStats } = useUserStats(selectedRepository);
  const { eventStats, loading: eventStatsLoading, refetch: refetchEventStats } = useEventStats(selectedRepository);

  // Função para atualizar todos os dados
  const refreshAll = () => {
    console.log('Atualizando dados...');
    setLastRefreshTime(new Date());
    refetchRepos();
    refetchTimeline();
    refetchStats();
    refetchUserStats();
    refetchEventStats();
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(refreshAll, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedRepository]);

  const handleRepositoryChange = (repositoryId) => {
    setSelectedRepository(repositoryId);
  };

  const handleRepositoryDelete = async (repositoryId) => {
    try {
      await apiService.deleteRepository(repositoryId);
      
      // Se o repositório deletado era o selecionado, limpar seleção
      if (selectedRepository === repositoryId) {
        setSelectedRepository(null);
      }
      
      // Atualizar todos os dados
      refreshAll();
      
      console.log('Repositório removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover repositório:', error);
      throw error; // Re-throw para o componente lidar com o erro
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-gray-800" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Git Board</h1>
                <p className="text-sm text-gray-600">
                  GitHub Webhook Dashboard
                  {selectedRepository && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {repositories.find(r => r.id === selectedRepository)?.full_name || 'Repositório selecionado'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Tooltip content={tooltips.refreshButton} position="bottom">
                <button
                  onClick={refreshAll}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </button>
              </Tooltip>
              
              <Tooltip content={tooltips.settingsButton} position="bottom">
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} repositories={repositories} loading={statsLoading} />
        </div>

        {/* Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EventTypeChart eventStats={eventStats} loading={eventStatsLoading} />
          <UserStats userStats={userStats} loading={userStatsLoading} />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Timeline de Eventos
              </h2>
              <Tooltip content={tooltips.timeline} position="top">
                <div className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </Tooltip>
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-blue-600">Atualização automática a cada 30 segundos</span>
              {lastRefreshTime && (
                <Tooltip content={tooltips.lastUpdate} position="top">
                  <span className="ml-2 text-gray-400 cursor-help">
                    (Última atualização: {lastRefreshTime.toLocaleTimeString()})
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
          
          <Timeline events={timeline} loading={timelineLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Git Board - Dashboard para webhooks do GitHub</p>
            <p className="mt-1">
              Configure webhooks nos seus repositórios GitHub para começar a receber eventos
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        repositories={repositories}
        onRepositoryDelete={handleRepositoryDelete}
        selectedRepository={selectedRepository}
        onRepositoryChange={handleRepositoryChange}
      />
    </div>
  );
}

export default App;
