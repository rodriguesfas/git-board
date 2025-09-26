import React from 'react';
import { 
  GitCommit, 
  GitPullRequest, 
  AlertCircle, 
  Users, 
  Activity,
  TrendingUp
} from 'lucide-react';
import { formatNumber } from '../utils/formatDate';
import Tooltip, { useTooltips } from './Tooltip';

const StatsCards = ({ stats, loading }) => {
  const tooltips = useTooltips();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Nenhuma estatística disponível</div>
      </div>
    );
  }

  // Calcular totais
  const totals = stats.reduce((acc, stat) => ({
    totalEvents: acc.totalEvents + (stat.total_events || 0),
    totalPushes: acc.totalPushes + (stat.pushes || 0),
    totalPullRequests: acc.totalPullRequests + (stat.pull_requests || 0),
    totalIssues: acc.totalIssues + (stat.issues || 0),
    totalContributors: acc.totalContributors + (stat.unique_contributors || 0)
  }), {
    totalEvents: 0,
    totalPushes: 0,
    totalPullRequests: 0,
    totalIssues: 0,
    totalContributors: 0
  });

  const cards = [
    {
      title: 'Total de Eventos',
      value: formatNumber(totals.totalEvents),
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 text-blue-600',
      tooltip: tooltips.totalEvents
    },
    {
      title: 'Pushes',
      value: formatNumber(totals.totalPushes),
      icon: <GitCommit className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50 text-green-600',
      tooltip: "Commits enviados para os repositórios. Cada push pode conter um ou mais commits com mudanças no código."
    },
    {
      title: 'Pull Requests',
      value: formatNumber(totals.totalPullRequests),
      icon: <GitPullRequest className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 text-purple-600',
      tooltip: "Solicitações de merge de branches. Incluem aberturas, fechamentos, merges e reviews de PRs."
    },
    {
      title: 'Issues',
      value: formatNumber(totals.totalIssues),
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50 text-orange-600',
      tooltip: "Problemas, bugs, melhorias e discussões nos repositórios. Incluem aberturas, fechamentos e comentários."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <Tooltip content={card.tooltip} position="top">
                  <div className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
