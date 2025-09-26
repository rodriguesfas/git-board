import React from 'react';
import { Clock, Activity, TrendingUp, GitCommit, GitPullRequest, AlertCircle, Zap } from 'lucide-react';
import { formatNumber } from '../utils/formatDate';

const RecentActivity = ({ timeline, userStats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Atividade Recente
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Nenhuma atividade recente</div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const now = new Date();
  const lastEvent = timeline[0];
  const lastEventTime = new Date(lastEvent.created_at);
  const timeSinceLastEvent = Math.floor((now - lastEventTime) / (1000 * 60)); // minutos

  // Eventos das últimas 24 horas
  const last24Hours = timeline.filter(event => {
    const eventTime = new Date(event.created_at);
    return (now - eventTime) <= 24 * 60 * 60 * 1000;
  });

  // Eventos das últimas 7 dias
  const last7Days = timeline.filter(event => {
    const eventTime = new Date(event.created_at);
    return (now - eventTime) <= 7 * 24 * 60 * 60 * 1000;
  });

  // Estatísticas de produtividade
  const totalPushes = userStats?.reduce((sum, user) => sum + (user.pushes || 0), 0) || 0;
  const totalPRs = userStats?.reduce((sum, user) => sum + (user.pull_requests || 0), 0) || 0;
  const totalIssues = userStats?.reduce((sum, user) => sum + (user.issues || 0), 0) || 0;

  // Função para formatar tempo
  const formatTimeAgo = (minutes) => {
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  // Função para obter ícone do tipo de evento
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'push': return <GitCommit className="w-4 h-4" />;
      case 'pull_request': return <GitPullRequest className="w-4 h-4" />;
      case 'issues': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Função para obter cor do tipo de evento
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'push': return 'text-green-600 bg-green-100';
      case 'pull_request': return 'text-blue-600 bg-blue-100';
      case 'issues': return 'text-orange-600 bg-orange-100';
      case 'workflow_run': return 'text-purple-600 bg-purple-100';
      case 'check_run': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Atividade Recente
      </h3>
      
      {/* Último Evento */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Último Evento</span>
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatTimeAgo(timeSinceLastEvent)}
          </span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className={`p-2 rounded-full ${getEventColor(lastEvent.event_type)}`}>
            {getEventIcon(lastEvent.event_type)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 capitalize">
              {lastEvent.event_type.replace('_', ' ')}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(lastEvent.created_at).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas de Produtividade */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{totalPushes}</div>
          <div className="text-xs text-green-800">Pushes</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{totalPRs}</div>
          <div className="text-xs text-blue-800">Pull Requests</div>
        </div>
      </div>

      {/* Atividade por Período */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Últimas 24h
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatNumber(last24Hours.length)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Últimos 7 dias
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatNumber(last7Days.length)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
