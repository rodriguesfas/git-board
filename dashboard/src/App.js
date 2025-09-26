import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings, Github, Wifi, WifiOff } from 'lucide-react';
import Timeline from './components/Timeline';
import StatsCards from './components/StatsCards';
import UserStats from './components/UserStats';
import EventTypeChart from './components/EventTypeChart';
import RepositorySelector from './components/RepositorySelector';
import { useTimeline, useStats, useUserStats, useEventStats, useRepositories } from './hooks/useApi';
import { useSSE } from './hooks/useSSE';

function App() {
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

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

  // SSE para notificações em tempo real
  const { isConnected: sseConnected } = useSSE(
    '/api/sse.php',
    (data) => {
      console.log('Novo evento recebido via SSE, atualizando dados...', data);
      refreshAll();
    },
    (error) => {
      console.error('Erro na conexão SSE:', error);
    }
  );

  // Auto-refresh a cada 60 segundos (fallback caso SSE falhe)
  useEffect(() => {
    const interval = setInterval(refreshAll, 60000);
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
                <p className="text-sm text-gray-600">GitHub Webhook Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Indicador de conexão SSE */}
              <div className="flex items-center space-x-2">
                {sseConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs ml-1">Tempo Real</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs ml-1">Offline</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={refreshAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repository Selector */}
        <div className="mb-6">
          <RepositorySelector
            repositories={repositories}
            selectedRepository={selectedRepository}
            onRepositoryChange={handleRepositoryChange}
            loading={reposLoading}
          />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} loading={statsLoading} />
        </div>

        {/* Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EventTypeChart eventStats={eventStats} loading={eventStatsLoading} />
          <UserStats userStats={userStats} loading={userStatsLoading} />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Timeline de Eventos
            </h2>
            <div className="text-sm text-gray-500">
              {sseConnected ? (
                <span className="text-green-600">Atualização em tempo real ativa</span>
              ) : (
                <span className="text-yellow-600">Atualização automática a cada 60 segundos</span>
              )}
              {lastRefreshTime && (
                <span className="ml-2 text-gray-400">
                  (Última atualização: {lastRefreshTime.toLocaleTimeString()})
                </span>
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
    </div>
  );
}

export default App;
