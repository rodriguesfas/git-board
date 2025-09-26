import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Settings, Github, Keyboard } from 'lucide-react';
import Timeline from './components/Timeline';
import StatsCards from './components/StatsCards';
import UserStats from './components/UserStats';
import EventTypeChart from './components/EventTypeChart';
import SettingsModal from './components/SettingsModal';
import AdvancedFilters from './components/AdvancedFilters';
import ActivityChart from './components/ActivityChart';
import NotificationSystem from './components/NotificationSystem';
import HealthCheck from './components/HealthCheck';
import ReportsInsights from './components/ReportsInsights';
import KeyboardShortcuts, { useKeyboardShortcuts } from './components/KeyboardShortcuts';
import CompactMode, { useCompactMode, CompactWrapper } from './components/CompactMode';
import { useTimeline, useStats, useUserStats, useEventStats, useRepositories } from './hooks/useApi';
import { useFilters } from './hooks/useFilters';
import Tooltip, { useTooltips } from './components/Tooltip';
import { apiService } from './services/api';
import './compact-mode.css';

function App() {
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, timeline, reports
  const tooltips = useTooltips();
  const { isCompact, toggleCompactMode } = useCompactMode();

  // Hooks para buscar dados
  const { repositories, loading: reposLoading, refetch: refetchRepos } = useRepositories();
  const { timeline, loading: timelineLoading, refetch: refetchTimeline } = useTimeline(selectedRepository);
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(selectedRepository);
  const { userStats, loading: userStatsLoading, refetch: refetchUserStats } = useUserStats(selectedRepository);
  const { eventStats, loading: eventStatsLoading, refetch: refetchEventStats } = useEventStats(selectedRepository);
  
  // Hook para filtros
  const { filteredEvents, updateFilters: updateFiltersRaw } = useFilters(timeline);
  
  // Memoizar a função updateFilters para evitar loops infinitos
  const updateFilters = useCallback((newFilters) => {
    updateFiltersRaw(newFilters);
  }, [updateFiltersRaw]);
  
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
  
  // Hook para atalhos de teclado
  useKeyboardShortcuts({
    refresh: refreshAll,
    settings: () => setShowSettingsModal(true),
    filters: () => setShowFilters(!showFilters),
    help: () => setShowKeyboardShortcuts(true),
    close: () => {
      setShowSettingsModal(false);
      setShowFilters(false);
      setShowKeyboardShortcuts(false);
    },
    dashboard: () => setCurrentView('dashboard'),
    timeline: () => setCurrentView('timeline'),
    reports: () => setCurrentView('reports')
  });

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
            
            <div className="flex items-center space-x-2">
              <Tooltip content={tooltips.refreshButton} position="bottom">
                <button
                  onClick={refreshAll}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </button>
              </Tooltip>
              
              <div className="relative">
                <AdvancedFilters
                  events={timeline}
                  repositories={repositories}
                  onFiltersChange={updateFilters}
                  isOpen={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
              </div>
              
              <CompactMode
                isCompact={isCompact}
                onToggle={toggleCompactMode}
              />
              
              <NotificationSystem
                events={timeline}
                onNotificationSettings={() => setShowSettingsModal(true)}
              />
              
              <Tooltip content="Atalhos de teclado (Ctrl+H)" position="bottom">
                <button
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Atalhos
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
      <CompactWrapper isCompact={isCompact}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navegação de Views */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'reports', label: 'Relatórios' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === view.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="mb-8">
                <StatsCards stats={stats} repositories={repositories} loading={statsLoading} />
              </div>

              {/* Health Check */}
              <div className="mb-8">
                <HealthCheck />
              </div>

              {/* Charts and Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <EventTypeChart eventStats={eventStats} loading={eventStatsLoading} />
                <UserStats userStats={userStats} loading={userStatsLoading} />
              </div>

              {/* Activity Chart */}
              <div className="mb-8">
                <ActivityChart events={timeline} loading={timelineLoading} />
              </div>
            </>
          )}

          {/* Timeline View */}
          {currentView === 'timeline' && (
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
              
              <Timeline events={filteredEvents} loading={timelineLoading} />
            </div>
          )}

          {/* Reports View */}
          {currentView === 'reports' && (
            <div className="mb-8">
              <ReportsInsights 
                events={timeline} 
                repositories={repositories} 
                users={userStats} 
              />
            </div>
          )}
        </main>
      </CompactWrapper>

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

      {/* Modal de Atalhos de Teclado */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}

export default App;
